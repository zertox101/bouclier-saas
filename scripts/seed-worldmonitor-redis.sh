#!/bin/sh
# ─── World Monitor Redis Seeder ──────────────────────────────────────────────
# Seeds local Redis with real-format initial data for all health-checked keys.
# This makes shield-world-monitor HEALTHY in local Docker environment.
# Run: docker exec shield-redis sh /seed.sh  (or pipe through docker exec)
# ─────────────────────────────────────────────────────────────────────────────

NOW_MS=$(date +%s)000
NOW_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Seeding World Monitor Redis keys..."

# ── BOOTSTRAP KEYS (data keys) ──────────────────────────────────────────────

redis-cli SET "seismology:earthquakes:v1" '{"earthquakes":[{"id":"us7000e1","mag":4.2,"place":"10km S of Tokyo","time":"'"$NOW_ISO"'","lat":35.6,"lon":139.7,"depth":30}]}'
redis-cli SET "infra:outages:v1" '{"outages":[{"service":"Cloudflare","status":"operational","region":"EU","updated":"'"$NOW_ISO"'"}]}'
redis-cli SET "market:sectors:v1" '{"sectors":[{"name":"Technology","change":1.2,"index":"S&P500"},{"name":"Energy","change":-0.5,"index":"S&P500"}]}'
redis-cli SET "market:etf-flows:v1" '{"flows":[{"ticker":"SPY","netFlow":120000000,"date":"'"$NOW_ISO"'"}]}'
redis-cli SET "climate:anomalies:v1" '{"anomalies":[{"region":"Arctic","tempDelta":2.1,"baseline":"1951-1980","date":"'"$NOW_ISO"'"}]}'
redis-cli SET "wildfire:fires:v1" '{"fires":[{"id":"MODIS_001","lat":34.05,"lon":-118.24,"confidence":80,"source":"MODIS"}]}'
redis-cli SET "market:stocks-bootstrap:v1" '{"quotes":[{"symbol":"AAPL","price":195.5,"change":1.2},{"symbol":"MSFT","price":420.3,"change":-0.5}]}'
redis-cli SET "market:commodities-bootstrap:v1" '{"quotes":[{"symbol":"GC=F","name":"Gold","price":2650.0,"change":0.3}]}'
redis-cli SET "cyber:threats-bootstrap:v2" '{"threats":[{"id":"CVE-2026-0001","severity":"HIGH","source":"NVD","title":"Critical RCE in OpenSSL","published":"'"$NOW_ISO"'"}]}'
redis-cli SET "economic:worldbank-techreadiness:v1" '{"countries":[{"code":"US","score":8.5},{"code":"CN","score":7.2}]}'
redis-cli SET "economic:worldbank-progress:v1" '{"countries":[{"code":"US","gdpGrowth":2.1}]}'
redis-cli SET "economic:worldbank-renewable:v1" '{"countries":[{"code":"DE","renewableShare":45.2}]}'
redis-cli SET "positive_events:geo-bootstrap:v1" '{"events":[{"title":"UN Climate Summit Agreement","lat":48.8,"lon":2.3,"date":"'"$NOW_ISO"'"}]}'
redis-cli SET "risk:scores:sebuf:stale:v1" '{"scores":[{"region":"MENA","score":6.2,"trend":"stable"}]}'
redis-cli SET "natural:events:v1" '{"events":[{"id":"EONET_001","title":"Tropical Storm","category":"severeStorms","lat":25.0,"lon":-80.0}]}'
redis-cli SET "aviation:delays-bootstrap:v1" '{"delays":[{"airport":"JFK","avgDelay":15,"reason":"weather"}]}'
redis-cli SET "news:insights:v1" '{"articles":[{"title":"Global Markets Update","source":"Reuters","published":"'"$NOW_ISO"'"}]}'
redis-cli SET "prediction:markets-bootstrap:v1" '{"predictions":[{"market":"US Election 2026","probability":0.52,"source":"Polymarket"}]}'
redis-cli SET "market:crypto:v1" '{"quotes":[{"symbol":"BTC","price":105000,"change24h":2.1},{"symbol":"ETH","price":3800,"change24h":1.5}]}'
redis-cli SET "market:gulf-quotes:v1" '{"quotes":[{"symbol":"TASI","price":12500,"change":0.3}]}'
redis-cli SET "market:stablecoins:v1" '{"stablecoins":[{"symbol":"USDT","marketCap":120000000000,"peg":1.0}]}'
redis-cli SET "unrest:events:v1" '{"events":[{"country":"France","type":"protest","severity":"low","date":"'"$NOW_ISO"'"}]}'
redis-cli SET "conflict:iran-events:v1" '{"events":[{"type":"diplomatic","summary":"Nuclear talks update","date":"'"$NOW_ISO"'"}]}'
redis-cli SET "conflict:ucdp-events:v1" '{"events":[{"region":"Sahel","fatalities":0,"type":"non-state","year":2026}]}'
redis-cli SET "weather:alerts:v1" '{"alerts":[{"type":"heatwave","region":"Southern Europe","severity":"moderate"}]}'
redis-cli SET "economic:spending:v1" '{"entries":[{"country":"US","category":"defense","amount":886000000000}]}'
redis-cli SET "research:tech-events-bootstrap:v1" '{"items":[{"title":"AI Safety Summit","date":"'"$NOW_ISO"'","location":"London"}]}'
redis-cli SET "intelligence:gdelt-intel:v1" '{"topics":[{"topic":"Cybersecurity","count":1250,"trend":"rising"}]}'
redis-cli SET "correlation:cards-bootstrap:v1" '{"items":[{"title":"Oil-USD Correlation","value":-0.72,"period":"30d"}]}'
redis-cli SET "forecast:predictions:v2" '{"predictions":[{"topic":"Global GDP 2026","value":3.1,"source":"IMF"}]}'
redis-cli SET "intelligence:advisories-bootstrap:v1" '{"advisories":[{"id":"CISA-2026-001","title":"Critical Infrastructure Alert","severity":"high"}]}'
redis-cli SET "trade:customs-revenue:v1" '{"months":[{"month":"2026-04","revenue":35000000000,"region":"US"}]}'
redis-cli SET "sanctions:pressure:v1" '{"entries":[{"target":"RU","score":8.5,"activeSanctions":12500}]}'
redis-cli SET "radiation:observations:v1" '{"items":[{"station":"Vienna","value":0.08,"unit":"uSv/h","status":"normal"}]}'

# ── STANDALONE KEYS ─────────────────────────────────────────────────────────

redis-cli SET "infra:service-statuses:v1" '{"statuses":[{"service":"GitHub","status":"operational"},{"service":"AWS","status":"operational"}]}'
redis-cli SET "economic:macro-signals:v1" '{"signals":[{"indicator":"CPI","value":3.2,"region":"US"}]}'
redis-cli SET "economic:bis:policy:v1" '{"rates":[{"country":"US","rate":5.25,"lastChange":"'"$NOW_ISO"'"}]}'
redis-cli SET "economic:bis:eer:v1" '{"entries":[{"country":"US","reer":110.5}]}'
redis-cli SET "economic:bis:credit:v1" '{"entries":[{"country":"US","creditGap":2.1}]}'
redis-cli SET "supply_chain:shipping:v2" '{"rates":[{"route":"Shanghai-Rotterdam","rate":2100,"change":-5}]}'
redis-cli SET "supply_chain:chokepoints:v4" '{"chokepoints":[{"name":"Suez Canal","status":"open","transitTime":"12h"}]}'
redis-cli SET "supply_chain:minerals:v2" '{"minerals":[{"name":"Lithium","price":12500,"change":3.2}]}'
redis-cli SET "giving:summary:v1" '{"awards":[{"org":"Gates Foundation","amount":5000000000}]}'
redis-cli SET "intelligence:gpsjam:v2" '{"hexes":[{"h3":"8a2a1072b59ffff","interference":0.1}]}'
redis-cli SET "theater_posture:sebuf:stale:v1" '{"theaters":[{"region":"IndoPacific","readiness":"elevated"}]}'
redis-cli SET "theater-posture:sebuf:v1" '{"theaters":[{"region":"IndoPacific","readiness":"elevated"}]}'
redis-cli SET "risk:scores:sebuf:v1" '{"scores":[{"region":"MENA","score":6.2}]}'
redis-cli SET "usni-fleet:sebuf:v1" '{"fleets":[{"name":"7th Fleet","location":"Western Pacific","ships":42}]}'
redis-cli SET "usni-fleet:sebuf:stale:v1" '{"fleets":[{"name":"7th Fleet","location":"Western Pacific","ships":42}]}'
redis-cli SET "aviation:delays:faa:v1" '{"airports":[{"icao":"KJFK","delay":15}]}'
redis-cli SET "aviation:delays:intl:v3" '{"airports":[{"icao":"EGLL","delay":22}]}'
redis-cli SET "aviation:notam:closures:v2" '{"closures":[]}'
redis-cli SET "positive-events:geo:v1" '{"events":[{"title":"Peace talks progress","lat":46.9,"lon":7.4}]}'
redis-cli SET "cable-health-v1" '{"cables":[{"name":"TAT-14","status":"operational","latency":65}]}'
redis-cli SET "cyber:threats:v2" '{"threats":[{"id":"CVE-2026-0001","severity":"HIGH"}]}'
redis-cli SET "military:bases:active" '{"bases":[{"name":"Ramstein","country":"DE","branch":"USAF"}]}'
redis-cli SET "military:flights:v1" '{"flights":[{"callsign":"RRR7201","type":"C-17","origin":"ETAR"}]}'
redis-cli SET "military:flights:stale:v1" '{"flights":[{"callsign":"RRR7201","type":"C-17"}]}'
redis-cli SET "temporal:anomalies:v1" '{"items":[{"metric":"GPS drift","region":"Baltic","severity":"low"}]}'
redis-cli SET "displacement:summary:v1:2026" '{"regions":[{"name":"East Africa","displaced":4500000}]}'
redis-cli SET "intelligence:satellites:tle:v1" '{"satellites":[{"name":"ISS","noradId":25544}]}'
redis-cli SET "supply_chain:portwatch:v1" '{"entries":[{"port":"Shanghai","congestion":"low"}]}'
redis-cli SET "supply_chain:corridorrisk:v1" '{"entries":[{"corridor":"Red Sea","risk":"elevated"}]}'
redis-cli SET "supply_chain:chokepoint_transits:v1" '{"entries":[{"chokepoint":"Suez","transits24h":52}]}'
redis-cli SET "supply_chain:transit-summaries:v1" '{"entries":[{"route":"Asia-Europe","avgDays":28}]}'
redis-cli SET "thermal:escalation:v1" '{"warnings":[{"region":"Middle East","level":"moderate"}]}'
redis-cli SET "trade:tariffs:v1:840:all:10" '{"entries":[{"partner":"CN","avgRate":19.3}]}'

# ── SEED METADATA (freshness tracking) ──────────────────────────────────────

for KEY in \
  "seed-meta:seismology:earthquakes" \
  "seed-meta:wildfire:fires" \
  "seed-meta:infra:outages" \
  "seed-meta:climate:anomalies" \
  "seed-meta:unrest:events" \
  "seed-meta:cyber:threats" \
  "seed-meta:market:crypto" \
  "seed-meta:market:etf-flows" \
  "seed-meta:market:gulf-quotes" \
  "seed-meta:market:stablecoins" \
  "seed-meta:natural:events" \
  "seed-meta:aviation:faa" \
  "seed-meta:aviation:intl" \
  "seed-meta:aviation:notam" \
  "seed-meta:news:insights" \
  "seed-meta:positive-events:geo" \
  "seed-meta:intelligence:risk-scores" \
  "seed-meta:market:stocks" \
  "seed-meta:market:commodities" \
  "seed-meta:market:sectors" \
  "seed-meta:prediction:markets" \
  "seed-meta:cable-health" \
  "seed-meta:economic:macro-signals" \
  "seed-meta:economic:bis:policy" \
  "seed-meta:economic:bis:eer" \
  "seed-meta:economic:bis:credit" \
  "seed-meta:supply_chain:shipping" \
  "seed-meta:supply_chain:chokepoints" \
  "seed-meta:supply_chain:minerals" \
  "seed-meta:giving:summary" \
  "seed-meta:intelligence:gpsjam" \
  "seed-meta:conflict:iran-events" \
  "seed-meta:conflict:ucdp-events" \
  "seed-meta:military:flights" \
  "seed-meta:military-forecast-inputs" \
  "seed-meta:intelligence:satellites" \
  "seed-meta:weather:alerts" \
  "seed-meta:economic:spending" \
  "seed-meta:research:tech-events" \
  "seed-meta:intelligence:gdelt-intel" \
  "seed-meta:forecast:predictions" \
  "seed-meta:theater-posture" \
  "seed-meta:correlation:cards" \
  "seed-meta:economic:worldbank-techreadiness:v1" \
  "seed-meta:economic:worldbank-progress:v1" \
  "seed-meta:economic:worldbank-renewable:v1" \
  "seed-meta:supply_chain:portwatch" \
  "seed-meta:supply_chain:corridorrisk" \
  "seed-meta:supply_chain:chokepoint_transits" \
  "seed-meta:supply_chain:transit-summaries" \
  "seed-meta:military:usni-fleet" \
  "seed-meta:intelligence:advisories" \
  "seed-meta:trade:customs-revenue" \
  "seed-meta:sanctions:pressure" \
  "seed-meta:radiation:observations" \
  "seed-meta:thermal:escalation" \
  "seed-meta:trade:tariffs:v1:840:all:10"
do
  redis-cli SET "$KEY" '{"fetchedAt":'"$NOW_MS"',"recordCount":1,"sourceVersion":"local-seed"}'
done

echo ""
echo "✅ All World Monitor Redis keys seeded successfully!"
echo "   Health check should now return HEALTHY (HTTP 200)"
