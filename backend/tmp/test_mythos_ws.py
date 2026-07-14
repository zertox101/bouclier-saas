import asyncio, httpx, json

async def test():
    target = 'scanme.nmap.org'
    async with httpx.AsyncClient() as c:
        resp = await c.post('http://tools-api:8100/agent/analyze',
            json={'target': target, 'mode': 'mythos'},
            headers={'X-Api-Key': 'BOUCLIER_ALPHA_SESSION_2026'}
        )
        job = resp.json()
        jid = job['agent_job_id']
        print(f'Job: {jid}')
        
        seen = set()
        for i in range(300):
            jr = await c.get(f'http://tools-api:8100/agent/jobs/{jid}')
            if jr.status_code == 200:
                d = jr.json()
                ph = d.get('current_phase', '')
                if ph and ph not in seen:
                    seen.add(ph)
                    print(f'Phase: {ph}')
                if d.get('status') == 'completed':
                    f = d.get('findings', {})
                    s = f.get('structured_findings', [])
                    r = f.get('raw_mythos_analysis', '')
                    print(f'Completed! Findings: {len(s)}')
                    print(f'LLM: {r[:300]}')
                    for ff in s[:8]:
                        print(f"  [{ff['severity']}] {ff['name']}")
                    if len(s) > 8:
                        print(f'  ... +{len(s)-8} more')
                    return
            await asyncio.sleep(2)
        print('Timeout')

asyncio.run(test())
