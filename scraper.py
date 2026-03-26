#!/usr/bin/env python3
"""Scrape Telegram channels for enemy losses data."""

import re
import json
import subprocess
import time
import html as html_module
from datetime import datetime, timezone

OUTPUT_FILE = "/Users/jamalcheaib/.openclaw/workspace/warroom/losses-raw-data.json"
START_DATE = "2026-02-28"
END_DATE = "2026-03-26"

def fetch_page(channel, before=None):
    url = f"https://t.me/s/{channel}"
    if before:
        url += f"?before={before}"
    result = subprocess.run(["curl", "-s", "-L", url], capture_output=True, text=True, timeout=30)
    return result.stdout

def parse_messages(html, channel):
    """Extract messages with post ID, text, and datetime."""
    # Find all message blocks
    posts = re.findall(
        r'data-post="' + channel + r'/(\d+)"[\s\S]*?'
        r'(?:<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)</div>\s*'
        r'(?:<div class="tgme_widget_message_footer|<div class="tgme_widget_message_info))?',
        html
    )
    
    times = re.findall(
        r'data-post="' + channel + r'/(\d+)"[\s\S]*?<time[^>]+datetime="([^"]+)"',
        html
    )
    time_map = {pid: dt for pid, dt in times}
    
    messages = []
    for pid, text in posts:
        dt = time_map.get(pid, "")
        # Strip HTML tags for analysis
        clean = re.sub(r'<[^>]+>', ' ', text)
        clean = html_module.unescape(clean).strip()
        clean = re.sub(r'\s+', ' ', clean)
        messages.append({
            "id": int(pid),
            "datetime": dt,
            "text": clean,
            "raw_html": text
        })
    return messages

def get_min_post_id(html, channel):
    ids = re.findall(r'data-post="' + channel + r'/(\d+)"', html)
    if not ids:
        return None
    return min(int(x) for x in ids)

def scrape_channel(channel):
    """Scrape all messages from channel back to START_DATE."""
    all_messages = []
    seen_ids = set()
    before = None
    page = 0
    
    while True:
        page += 1
        print(f"[{channel}] Page {page}, before={before}")
        html = fetch_page(channel, before)
        
        if not html or len(html) < 500:
            print(f"[{channel}] Empty response, stopping.")
            break
        
        msgs = parse_messages(html, channel)
        if not msgs:
            print(f"[{channel}] No messages found on page {page}, stopping.")
            break
        
        new_count = 0
        earliest_date = None
        for m in msgs:
            if m["id"] not in seen_ids:
                seen_ids.add(m["id"])
                all_messages.append(m)
                new_count += 1
                if m["datetime"]:
                    d = m["datetime"][:10]
                    if earliest_date is None or d < earliest_date:
                        earliest_date = d
        
        print(f"[{channel}] Got {new_count} new msgs, earliest={earliest_date}")
        
        if new_count == 0:
            break
        
        # Check if we've gone far enough back
        if earliest_date and earliest_date < START_DATE:
            print(f"[{channel}] Reached before start date, stopping.")
            break
        
        min_id = get_min_post_id(html, channel)
        if min_id is None or (before is not None and min_id >= before):
            break
        before = min_id
        
        time.sleep(1)  # Rate limit
    
    # Filter to date range
    filtered = []
    for m in all_messages:
        if m["datetime"]:
            d = m["datetime"][:10]
            if START_DATE <= d <= END_DATE:
                filtered.append(m)
    
    filtered.sort(key=lambda x: x["datetime"])
    print(f"[{channel}] Total in range: {len(filtered)}")
    return filtered


def extract_mmirleb_losses(messages):
    """Extract tank/vehicle losses from @mmirleb statements."""
    losses = []
    
    tank_patterns = [
        (r'دبّ?ابة?\s+(?:ميركافا|Merkava)', 'tanks', 'Merkava'),
        (r'دبابة\s+ميركافا', 'tanks', 'Merkava'),
        (r'ميركافا', 'tanks', 'Merkava'),
        (r'جرّ?افة\s+D9', 'tanks', 'D9 Bulldozer'),
        (r'جرافة\s+D9', 'tanks', 'D9 Bulldozer'),
        (r'جرّ?افة\s+عسكرية', 'tanks', 'Military Bulldozer'),
        (r'ناقلة?\s+جند', 'tanks', 'APC'),
        (r'ناقلة?\s+نمر', 'tanks', 'Namer APC'),
        (r'آلية?\s+عسكرية', 'tanks', 'Military Vehicle'),
        (r'آلية?\s+مدرّ?عة', 'tanks', 'Armored Vehicle'),
        (r'همر|هامر|Humvee', 'tanks', 'Humvee'),
        (r'مسيّ?رة|طائرة\s+مسيّ?رة|drone', 'drones', 'Drone'),
    ]
    
    for m in messages:
        text = m["text"]
        date = m["datetime"][:10] if m["datetime"] else ""
        
        for pattern, category, subcategory in tank_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Count occurrences
                count = len(matches)
                loss_id = f"mmirleb-{m['id']}-{category}-{subcategory.replace(' ', '_')}"
                losses.append({
                    "id": loss_id,
                    "date": date,
                    "category": category,
                    "subcategory": subcategory,
                    "count": count,
                    "description": text[:200],
                    "source": "@mmirleb",
                    "messageId": str(m["id"])
                })
    
    # Deduplicate by id
    seen = set()
    deduped = []
    for l in losses:
        if l["id"] not in seen:
            seen.add(l["id"])
            deduped.append(l)
    return deduped


def extract_c_military_losses(messages):
    """Extract casualties and other losses from @C_Military1."""
    losses = []
    
    for m in messages:
        text = m["text"]
        date = m["datetime"][:10] if m["datetime"] else ""
        mid = str(m["id"])
        
        # Soldiers killed
        killed_patterns = [
            r'(\d+)\s*(?:جند(?:ي|ياً|يين)?|عسكري(?:ين|ا)?)\s*(?:قت(?:ي?ل|لى|لوا))',
            r'(?:مقتل|استشهاد|قتل)\s*(\d+)\s*(?:جند|عسكري)',
            r'(\d+)\s*(?:قت(?:ي?ل|لى))\s*(?:من\s+)?(?:جنود|الجنود|جيش)',
        ]
        for p in killed_patterns:
            match = re.search(p, text)
            if match:
                count = int(match.group(1))
                losses.append({
                    "id": f"cmil-{mid}-soldiers_killed",
                    "date": date,
                    "category": "soldiers_killed",
                    "count": count,
                    "description": text[:200],
                    "source": "@C_Military1",
                    "messageId": mid
                })
                break
        
        # Soldiers wounded
        wounded_patterns = [
            r'(\d+)\s*(?:جند|عسكري)\S*\s*(?:جر(?:ي?ح|حى|يح))',
            r'(?:إصابة|جرح)\s*(\d+)\s*(?:جند|عسكري)',
            r'(\d+)\s*(?:جر(?:ي?ح|حى))\s*(?:من\s+)?(?:جنود|الجنود)',
        ]
        for p in wounded_patterns:
            match = re.search(p, text)
            if match:
                count = int(match.group(1))
                losses.append({
                    "id": f"cmil-{mid}-soldiers_wounded",
                    "date": date,
                    "category": "soldiers_wounded",
                    "count": count,
                    "description": text[:200],
                    "source": "@C_Military1",
                    "messageId": mid
                })
                break
        
        # Settlers killed
        settler_k_patterns = [
            r'(\d+)\s*(?:مستوطن|مدني)\S*\s*(?:قت)',
            r'(?:مقتل)\s*(\d+)\s*(?:مستوطن|مدني)',
        ]
        for p in settler_k_patterns:
            match = re.search(p, text)
            if match:
                count = int(match.group(1))
                losses.append({
                    "id": f"cmil-{mid}-settlers_killed",
                    "date": date,
                    "category": "settlers_killed",
                    "count": count,
                    "description": text[:200],
                    "source": "@C_Military1",
                    "messageId": mid
                })
                break
        
        # Settlers wounded
        settler_w_patterns = [
            r'(\d+)\s*(?:مستوطن|مدني)\S*\s*(?:جر(?:ي?ح|حى))',
            r'(?:إصابة)\s*(\d+)\s*(?:مستوطن|مدني)',
        ]
        for p in settler_w_patterns:
            match = re.search(p, text)
            if match:
                count = int(match.group(1))
                losses.append({
                    "id": f"cmil-{mid}-settlers_wounded",
                    "date": date,
                    "category": "settlers_wounded",
                    "count": count,
                    "description": text[:200],
                    "source": "@C_Military1",
                    "messageId": mid
                })
                break
        
        # Drones
        drone_patterns = [
            r'(?:إسقاط|أسقط\S*|سقوط)\s*(?:(\d+)\s*)?(?:مسيّ?رة|طائرة)',
            r'(\d+)\s*(?:مسيّ?رة|طائرة)\s*(?:مسيّ?رة)?\s*(?:أُسقط|سقط)',
        ]
        for p in drone_patterns:
            match = re.search(p, text)
            if match:
                count = int(match.group(1)) if match.group(1) else 1
                losses.append({
                    "id": f"cmil-{mid}-drones",
                    "date": date,
                    "category": "drones",
                    "count": count,
                    "description": text[:200],
                    "source": "@C_Military1",
                    "messageId": mid
                })
                break
        
        # Military bases
        base_patterns = [
            r'(?:استهداف|قصف|ضرب)\s*(?:(\d+)\s*)?(?:قاعدة|موقع|ثكنة)\s*عسكري',
            r'(\d+)\s*(?:قاعدة|موقع)\s*عسكري',
        ]
        for p in base_patterns:
            match = re.search(p, text)
            if match:
                count = int(match.group(1)) if match.group(1) else 1
                losses.append({
                    "id": f"cmil-{mid}-bases",
                    "date": date,
                    "category": "bases",
                    "count": count,
                    "description": text[:200],
                    "source": "@C_Military1",
                    "messageId": mid
                })
                break
    
    # Deduplicate
    seen = set()
    deduped = []
    for l in losses:
        if l["id"] not in seen:
            seen.add(l["id"])
            deduped.append(l)
    return deduped


def build_daily_summary(losses):
    summary = {}
    for l in losses:
        d = l["date"]
        if d not in summary:
            summary[d] = {}
        cat = l["category"]
        summary[d][cat] = summary[d].get(cat, 0) + l["count"]
    return dict(sorted(summary.items()))


def main():
    print("=== Scraping @mmirleb ===")
    mmirleb_msgs = scrape_channel("mmirleb")
    
    print("\n=== Scraping @C_Military1 ===")
    cmil_msgs = scrape_channel("C_Military1")
    
    print("\n=== Extracting losses ===")
    losses1 = extract_mmirleb_losses(mmirleb_msgs)
    print(f"@mmirleb: {len(losses1)} loss entries")
    
    losses2 = extract_c_military_losses(cmil_msgs)
    print(f"@C_Military1: {len(losses2)} loss entries")
    
    all_losses = losses1 + losses2
    daily = build_daily_summary(all_losses)
    
    output = {
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
        "sources": ["@mmirleb", "@C_Military1"],
        "dateRange": {"from": START_DATE, "to": END_DATE},
        "losses": all_losses,
        "dailySummary": daily
    }
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\nWrote {len(all_losses)} losses to {OUTPUT_FILE}")
    print(f"Daily summary: {json.dumps(daily, ensure_ascii=False, indent=2)}")
    
    # Save raw messages for debugging
    debug = {
        "mmirleb": mmirleb_msgs,
        "C_Military1": cmil_msgs
    }
    with open(OUTPUT_FILE.replace(".json", "-debug.json"), "w", encoding="utf-8") as f:
        json.dump(debug, f, ensure_ascii=False, indent=2)
    print(f"Debug data saved.")


if __name__ == "__main__":
    main()
