# ha-dashboard-screenshot

Programmatically create screenshots of Home Assistant dashboards.

## Usage

```bash
docker run -v $(pwd)/output:/app/output -e HA_API_KEY=<your-api-key> -e HA_API_URL=<your-homeassistant-url> ghcr.io/jeboehm/ha-dashboard-screenshot <dashboard-uri> <output-filename>
```

This will save the screenshot to the mounted `output` directory.
Internally, it will use the `chromium` browser to authenticate with Home Assistant and then take the screenshot of the specified dashboard.

I use it to provide a screenshot of Home Assistant for my TRMNL display.
