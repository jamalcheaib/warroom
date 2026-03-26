#!/usr/bin/env python3
"""Fast scraper - scrape both channels with optimized pagination."""

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
    result = subprocess.run(["curl", "-s", "-L", "--max-time", "15", url], capture_output=True, text=True, timeout=20)
    return result.stdout

def parse_messages(html, channel):
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
        clean = re.sub(r'<[^>]+>', ' ', text)
        clean = html_module.unescape(clean).strip()
        clean = re.sub(r'\s+', ' ', clean)
        messages.append({"id": int(pid), "datetime": dt, "text": clean, "raw_html": text})
    return messages

def get_min_post_id(html, channel):
    ids = re.findall(r'data-post="' + channel + r'/(\d+)"', html)
    return min(int(x) for x in ids) if ids else None

def scrape_channel(channel, sleep_time=0.5):
    all_messages = []
    seen_ids = set()
    before = None
    page = 0
    
    while True:
        page += 1
        if page % 10 == 0:
            print(f"[{channel}] Page {page}, before={before}")
        html = fetch_page(channel, before)
        if not html or len(html) < 500:
            break
        
        msgs = parse_messages(html, channel)
        if not msgs:
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
        
        if new_count == 0:
            break
        if earliest_date and earliest_date < START_DATE:
            print(f"[{channel}] Reached {earliest_date}, stopping at page {page}.")
            break
        
        min_id = get_min_post_id(html, channel)
        if min_id is None or (before is not None and min_id >= before):
            break
        before = min_id
        time.sleep(sleep_time)
    
    filtered = [m for m in all_messages if m["datetime"] and START_DATE <= m["datetime"][:10] <= END_DATE]
    filtered.sort(key=lambda x: x["datetime"])
    print(f"[{channel}] Total in date range: {len(filtered)} (scraped {len(all_messages)} total)")
    return filtered

def extract_mmirleb_losses(messages):
    losses = []
    tank_patterns = [
        (r'دبّ?ابة\s+ميركافا', 'tanks', 'Merkava'),
        (r'ميركافا', 'tanks', 'Merkava'),
        (r'جرّ?افة\s+D9', 'tanks', 'D9 Bulldozer'),
        (r'جرّ?افة\s+عسكرية', 'tanks', 'Military Bulldozer'),
        (r'ناقلة\s+جند', 'tanks', 'APC'),
        (r'ناقلة.*?نمر', 'tanks', 'Namer APC'),
        (r'آلي(?:ة|ات)\s+(?:عسكرية|مدرّ?عة)', 'tanks', 'Military Vehicle'),
        (r'همر|هامفي|Humvee', 'tanks', 'Humvee'),
    ]
    
    seen = set()
    for m in messages:
        text = m["text"]
        date = m["datetime"][:10] if m["datetime"] else ""
        
        for pattern, category, subcategory in tank_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                lid = f"mmirleb-{m['id']}-{category}-{subcategory.replace(' ', '_')}"
                if lid not in seen:
                    seen.add(lid)
                    losses.append({
                        "id": lid, "date": date, "category": category,
                        "subcategory": subcategory, "count": len(matches),
                        "description": text[:200], "source": "@mmirleb",
                        "messageId": str(m["id"])
                    })
        
        # Drones from mmirleb
        drone_match = re.findall(r'مسيّ?رة|طائرة\s+مسيّ?رة', text)
        if drone_match:
            lid = f"mmirleb-{m['id']}-drones"
            if lid not in seen:
                seen.add(lid)
                losses.append({
                    "id": lid, "date": date, "category": "drones",
                    "subcategory": "Drone", "count": len(drone_match),
                    "description": text[:200], "source": "@mmirleb",
                    "messageId": str(m["id"])
                })
    
    return losses

def extract_c_military_losses(messages):
    losses = []
    seen = set()
    
    for m in messages:
        text = m["text"]
        date = m["datetime"][:10] if m["datetime"] else ""
        mid = str(m["id"])
        
        # Soldiers killed - multiple patterns
        for p in [
            r'(\d+)\s*(?:جند(?:ي|ياً|يين)?|عسكري\S*)\s*(?:قت)',
            r'(?:مقتل|قتل)\s*(\d+)\s*(?:جند|عسكري)',
            r'(\d+)\s*قت(?:يل|لى)\s*(?:من\s+)?(?:جنود|الجنود|الجيش)',
        ]:
            match = re.search(p, text)
            if match:
                lid = f"cmil-{mid}-soldiers_killed"
                if lid not in seen:
                    seen.add(lid)
                    losses.append({"id": lid, "date": date, "category": "soldiers_killed",
                        "count": int(match.group(1)), "description": text[:200],
                        "source": "@C_Military1", "messageId": mid})
                break
        
        # Soldiers wounded
        for p in [
            r'(\d+)\s*(?:جند|عسكري)\S*\s*(?:جر(?:ي?ح|حى))',
            r'(?:إصابة|جرح)\s*(\d+)\s*(?:جند|عسكري)',
            r'(\d+)\s*جر(?:ي?ح|حى)\s*(?:من\s+)?(?:جنود|الجنود)',
        ]:
            match = re.search(p, text)
            if match:
                lid = f"cmil-{mid}-soldiers_wounded"
                if lid not in seen:
                    seen.add(lid)
                    losses.append({"id": lid, "date": date, "category": "soldiers_wounded",
                        "count": int(match.group(1)), "description": text[:200],
                        "source": "@C_Military1", "messageId": mid})
                break
        
        # Settlers killed
        for p in [r'(\d+)\s*مستوطن\S*\s*قت', r'مقتل\s*(\d+)\s*مستوطن']:
            match = re.search(p, text)
            if match:
                lid = f"cmil-{mid}-settlers_killed"
                if lid not in seen:
                    seen.add(lid)
                    losses.append({"id": lid, "date": date, "category": "settlers_killed",
                        "count": int(match.group(1)), "description": text[:200],
                        "source": "@C_Military1", "messageId": mid})
                break
        
        # Settlers wounded
        for p in [r'(\d+)\s*مستوطن\S*\s*(?:جر|إصاب)', r'إصابة\s*(\d+)\s*مستوطن']:
            match = re.search(p, text)
            if match:
                lid = f"cmil-{mid}-settlers_wounded"
                if lid not in seen:
                    seen.add(lid)
                    losses.append({"id": lid, "date": date, "category": "settlers_wounded",
                        "count": int(match.group(1)), "description": text[:200],
                        "source": "@C_Military1", "messageId": mid})
                break
        
        # Drones downed
        for p in [r'(?:إسقاط|أسقط\S*|سقوط)\s*(?:(\d+)\s*)?(?:مسيّ?رة|طائرة)', r'(\d+)\s*مسيّ?رة\s*(?:أُسقط|سقط)']:
            match = re.search(p, text)
            if match:
                lid = f"cmil-{mid}-drones"
                if lid not in seen:
                    seen.add(lid)
                    losses.append({"id": lid, "date": date, "category": "drones",
                        "count": int(match.group(1)) if match.group(1) else 1,
                        "description": text[:200], "source": "@C_Military1", "messageId": mid})
                break
        
        # Bases hit
        for p in [r'(?:استهداف|قصف|ضرب)\s*(?:(\d+)\s*)?(?:قاعدة|موقع|ثكنة)\s*عسكري']:
            match = re.search(p, text)
            if match:
                lid = f"cmil-{mid}-bases"
                if lid not in seen:
                    seen.add(lid)
                    losses.append({"id": lid, "date": date, "category": "bases",
                        "count": int(match.group(1)) if match.group(1) else 1,
                        "description": text[:200], "source": "@C_Military1", "messageId": mid})
                break
        
        # Tanks/vehicles from C_Military1 too
        for p in [r'دبّ?ابة|ميركافا|جرّ?افة|آلي(?:ة|ات)\s+(?:عسكرية|مدرّ?عة)']:
            match = re.search(p, text)
            if match:
                lid = f"cmil-{mid}-tanks"
                if lid not in seen:
                    seen.add(lid)
                    # Determine subcategory
                    sub = "Military Vehicle"
                    if re.search(r'ميركافا', text): sub = "Merkava"
                    elif re.search(r'جرّ?افة', text): sub = "Bulldozer"
                    elif re.search(r'دبّ?ابة', text): sub = "Tank"
                    losses.append({"id": lid, "date": date, "category": "tanks",
                        "subcategory": sub, "count": 1,
                        "description": text[:200], "source": "@C_Military1", "messageId": mid})
                break
    
    return losses

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
    mmirleb_msgs = scrape_channel("mmirleb", sleep_time=0.3)
    
    print("\n=== Scraping @C_Military1 ===")
    cmil_msgs = scrape_channel("C_Military1", sleep_time=0.3)
    
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
    print(f"Daily summary:")
    for d, s in sorted(daily.items()):
        print(f"  {d}: {s}")
    
    # Save debug
    with open(OUTPUT_FILE.replace(".json", "-debug.json"), "w", encoding="utf-8") as f:
        json.dump({"mmirleb": mmirleb_msgs, "C_Military1": cmil_msgs}, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
