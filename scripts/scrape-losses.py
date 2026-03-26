#!/usr/bin/env python3
"""
Scrape @mmirleb and @C_Military1 for enemy losses data.
Uses BeautifulSoup for reliable HTML parsing.
"""

import json, re, sys, time
from datetime import datetime
from urllib.request import urlopen, Request
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
CUTOFF_DATE = '2026-02-28'

def fetch_page(channel, before=None):
    url = f'https://t.me/s/{channel}'
    if before:
        url += f'?before={before}'
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=15) as r:
        return r.read().decode('utf-8')

def parse_messages(html, channel):
    soup = BeautifulSoup(html, 'html.parser')
    messages = []
    for widget in soup.find_all('div', class_='tgme_widget_message'):
        post = widget.get('data-post', '')
        if '/' not in post:
            continue
        msg_id = post.split('/')[1]
        
        text_div = widget.find('div', class_='tgme_widget_message_text')
        if not text_div:
            continue
        text = text_div.get_text(separator='\n').strip()
        
        time_tag = widget.find('time')
        ts = time_tag.get('datetime', '') if time_tag else ''
        
        # Extract media
        media_url = None
        photo = widget.find('a', class_='tgme_widget_message_photo_wrap')
        if photo:
            style = photo.get('style', '')
            m = re.search(r"url\('([^']+)'\)", style)
            if m:
                media_url = m.group(1)
        video = widget.find('video')
        if video:
            media_url = video.get('src', '')
        
        messages.append({
            'id': msg_id,
            'text': text,
            'time': ts,
            'media': media_url,
            'post': post,
        })
    return messages

def scrape_channel(channel, max_pages=80):
    """Scrape all messages back to CUTOFF_DATE."""
    all_msgs = []
    before = None
    page = 0
    
    while page < max_pages:
        try:
            html = fetch_page(channel, before)
            msgs = parse_messages(html, channel)
            if not msgs:
                break
            
            oldest_date = msgs[-1]['time'][:10] if msgs[-1]['time'] else ''
            print(f"  Page {page+1}: {len(msgs)} msgs, oldest: {oldest_date}, id range: {msgs[-1]['id']}-{msgs[0]['id']}", file=sys.stderr)
            
            all_msgs.extend(msgs)
            
            # Check if we've gone past cutoff
            if oldest_date and oldest_date < CUTOFF_DATE:
                break
            
            # Next page
            before = msgs[-1]['id']
            page += 1
            time.sleep(0.5)
        except Exception as e:
            print(f"  Error on page {page+1}: {e}", file=sys.stderr)
            break
    
    # Filter to only messages >= CUTOFF_DATE
    filtered = [m for m in all_msgs if m['time'][:10] >= CUTOFF_DATE]
    print(f"  Total: {len(all_msgs)} scraped, {len(filtered)} after cutoff filter", file=sys.stderr)
    return filtered

def extract_losses_mmirleb(messages):
    """Extract tank/vehicle losses from Hezbollah military statements."""
    losses = []
    
    for msg in messages:
        text = msg['text']
        date = msg['time'][:10]
        
        # Tanks - دبّابة ميركافا
        tank_matches = re.findall(r'دبّابة\s+ميركافا', text)
        if tank_matches:
            count = len(tank_matches)
            # Check for cumulative count like "ليصبح عدد الدبّابات المستهدفة ... X دبّابات"
            cum = re.search(r'ليصبح عدد الدبّابات[^٠-٩\d]*(\d+)', text)
            losses.append({
                'id': f'mmirleb-tank-{msg["id"]}',
                'date': date,
                'category': 'tanks',
                'subcategory': 'Merkava',
                'count': count,
                'description': text[:200].replace('\n', ' '),
                'source': '@mmirleb',
                'messageId': msg['id'],
            })
        
        # D9 bulldozers - جرّافة D9
        if 'جرّافة' in text or 'D9' in text:
            losses.append({
                'id': f'mmirleb-d9-{msg["id"]}',
                'date': date,
                'category': 'tanks',
                'subcategory': 'D9 Bulldozer',
                'count': 1,
                'description': text[:200].replace('\n', ' '),
                'source': '@mmirleb',
                'messageId': msg['id'],
            })
        
        # Military vehicles - ناقلة جند / آلية عسكرية
        if 'ناقلة جند' in text:
            losses.append({
                'id': f'mmirleb-apc-{msg["id"]}',
                'date': date,
                'category': 'tanks',
                'subcategory': 'APC',
                'count': 1,
                'description': text[:200].replace('\n', ' '),
                'source': '@mmirleb',
                'messageId': msg['id'],
            })
        
        if 'آلية عسكرية' in text or 'آليّة عسكريّة' in text:
            losses.append({
                'id': f'mmirleb-vehicle-{msg["id"]}',
                'date': date,
                'category': 'tanks',
                'subcategory': 'Military Vehicle',
                'count': 1,
                'description': text[:200].replace('\n', ' '),
                'source': '@mmirleb',
                'messageId': msg['id'],
            })
        
        # Drones - مسيّرة (when Hezbollah downs enemy drones)
        if re.search(r'إسقاط.*مسيّرة|مسيّرة.*أُسقطت|أسقط.*طائرة', text):
            losses.append({
                'id': f'mmirleb-drone-{msg["id"]}',
                'date': date,
                'category': 'drones',
                'subcategory': '',
                'count': 1,
                'description': text[:200].replace('\n', ' '),
                'source': '@mmirleb',
                'messageId': msg['id'],
            })
        
        # Soldiers - إصابات مؤكّدة / قتلى / جرحى (from mmirleb statements)
        if 'إصابات مؤكّدة' in text or 'إصابة مؤكّدة' in text:
            losses.append({
                'id': f'mmirleb-casualty-{msg["id"]}',
                'date': date,
                'category': 'soldiers_wounded',
                'subcategory': '',
                'count': 1,
                'description': text[:200].replace('\n', ' '),
                'source': '@mmirleb',
                'messageId': msg['id'],
            })
        
        # Bases - قاعدة / ثكنة
        if re.search(r'قاعدة\s+\w+|ثكنة\s+\w+', text):
            losses.append({
                'id': f'mmirleb-base-{msg["id"]}',
                'date': date,
                'category': 'bases',
                'subcategory': '',
                'count': 1,
                'description': text[:200].replace('\n', ' '),
                'source': '@mmirleb',
                'messageId': msg['id'],
            })
    
    return losses

def extract_losses_cmilitary(messages):
    """Extract casualty/infrastructure losses from @C_Military1."""
    losses = []
    
    for msg in messages:
        text = msg['text']
        date = msg['time'][:10]
        
        # Soldiers killed
        killed_match = re.search(r'مقتل\s+(\d+)\s*جند', text)
        if killed_match:
            losses.append({
                'id': f'cmil-killed-{msg["id"]}',
                'date': date,
                'category': 'soldiers_killed',
                'subcategory': '',
                'count': int(killed_match.group(1)),
                'description': text[:200].replace('\n', ' '),
                'source': '@C_Military1',
                'messageId': msg['id'],
            })
        elif 'مقتل جندي' in text:
            losses.append({
                'id': f'cmil-killed-{msg["id"]}',
                'date': date,
                'category': 'soldiers_killed',
                'subcategory': '',
                'count': 1,
                'description': text[:200].replace('\n', ' '),
                'source': '@C_Military1',
                'messageId': msg['id'],
            })
        
        # Soldiers wounded
        wounded_match = re.search(r'إصابة\s+(\d+)\s*جند', text)
        if wounded_match:
            losses.append({
                'id': f'cmil-wounded-{msg["id"]}',
                'date': date,
                'category': 'soldiers_wounded',
                'subcategory': '',
                'count': int(wounded_match.group(1)),
                'description': text[:200].replace('\n', ' '),
                'source': '@C_Military1',
                'messageId': msg['id'],
            })
        
        # Settlers
        settler_killed = re.search(r'مقتل\s+(\d+)\s*مستوطن', text)
        if settler_killed:
            losses.append({
                'id': f'cmil-settler-k-{msg["id"]}',
                'date': date,
                'category': 'settlers_killed',
                'subcategory': '',
                'count': int(settler_killed.group(1)),
                'description': text[:200].replace('\n', ' '),
                'source': '@C_Military1',
                'messageId': msg['id'],
            })
        
        # Tanks (from C_Military1 perspective)
        if 'دبابة' in text or 'ميركافا' in text or 'دبّابة' in text:
            tank_count = re.search(r'تدمير\s+(\d+)\s*دب', text)
            if tank_count:
                losses.append({
                    'id': f'cmil-tank-{msg["id"]}',
                    'date': date,
                    'category': 'tanks',
                    'subcategory': 'Merkava',
                    'count': int(tank_count.group(1)),
                    'description': text[:200].replace('\n', ' '),
                    'source': '@C_Military1',
                    'messageId': msg['id'],
                })
        
        # Drones
        drone_match = re.search(r'إسقاط\s+(\d+)?\s*(?:طائرة|مسيّرة)', text)
        if drone_match:
            losses.append({
                'id': f'cmil-drone-{msg["id"]}',
                'date': date,
                'category': 'drones',
                'subcategory': '',
                'count': int(drone_match.group(1) or 1),
                'description': text[:200].replace('\n', ' '),
                'source': '@C_Military1',
                'messageId': msg['id'],
            })
        
        # Infrastructure
        if re.search(r'تدمير.*بنية|بنى تحتية|محطة.*كهرباء|جسر.*دمّر', text):
            losses.append({
                'id': f'cmil-infra-{msg["id"]}',
                'date': date,
                'category': 'infrastructure',
                'subcategory': '',
                'count': 1,
                'description': text[:200].replace('\n', ' '),
                'source': '@C_Military1',
                'messageId': msg['id'],
            })
    
    return losses

def build_daily_summary(losses):
    summary = {}
    for l in losses:
        d = l['date']
        if d not in summary:
            summary[d] = {}
        cat = l['category']
        summary[d][cat] = summary[d].get(cat, 0) + l['count']
    return summary

if __name__ == '__main__':
    all_losses = []
    all_media = []
    
    # Scrape @mmirleb
    print("Scraping @mmirleb...", file=sys.stderr)
    mmirleb_msgs = scrape_channel('mmirleb')
    mmirleb_losses = extract_losses_mmirleb(mmirleb_msgs)
    all_losses.extend(mmirleb_losses)
    # Collect media
    for msg in mmirleb_msgs:
        if msg['media']:
            all_media.append({
                'post': msg['post'],
                'media': msg['media'],
                'time': msg['time'],
                'text': msg['text'][:100],
                'channel': 'mmirleb',
            })
    print(f"  @mmirleb: {len(mmirleb_losses)} loss entries from {len(mmirleb_msgs)} messages", file=sys.stderr)
    
    # Scrape @C_Military1
    print("Scraping @C_Military1...", file=sys.stderr)
    cmil_msgs = scrape_channel('C_Military1')
    cmil_losses = extract_losses_cmilitary(cmil_msgs)
    all_losses.extend(cmil_losses)
    for msg in cmil_msgs:
        if msg['media']:
            all_media.append({
                'post': msg['post'],
                'media': msg['media'],
                'time': msg['time'],
                'text': msg['text'][:100],
                'channel': 'C_Military1',
            })
    print(f"  @C_Military1: {len(cmil_losses)} loss entries from {len(cmil_msgs)} messages", file=sys.stderr)
    
    # Deduplicate by id
    seen = set()
    unique_losses = []
    for l in all_losses:
        if l['id'] not in seen:
            seen.add(l['id'])
            unique_losses.append(l)
    
    result = {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'sources': ['@mmirleb', '@C_Military1'],
        'dateRange': {'from': CUTOFF_DATE, 'to': datetime.utcnow().strftime('%Y-%m-%d')},
        'losses': unique_losses,
        'dailySummary': build_daily_summary(unique_losses),
        'media': all_media,
        'stats': {
            'mmirleb_messages': len(mmirleb_msgs),
            'cmilitary_messages': len(cmil_msgs),
            'total_loss_entries': len(unique_losses),
        }
    }
    
    print(json.dumps(result, ensure_ascii=False, indent=2))
