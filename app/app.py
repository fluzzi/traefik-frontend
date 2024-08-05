from flask import Flask, render_template
import re
import docker
import requests
import yaml
import os
from waitress import serve

app = Flask(__name__)

TRAEFIK_API_URL = os.getenv('TRAEFIK_API_URL')
# Check if TRAEFIK_API_URL is set
if not TRAEFIK_API_URL:
    raise ValueError("TRAEFIK_API_URL environment variable is required and not set.")
USER_COLORS_FILE = os.getenv('USER_COLORS_FILE', False)
USER_CONFIG_FILE = os.getenv('USER_CONFIG_FILE', False)
router_configs, group_configs, global_configs = {}, {}, {}
client = docker.from_env()

def get_defaults(global_configs):
    return {
        'REGEX_PATTERNS': global_configs.get('url_regex', [r".*"]),
        'DEFAULT_GROUP_PRIORITY': global_configs.get('group_priority', 100),
        'DEFAULT_GROUP': global_configs.get('default_group', 'Applications'),
        'DEFAULT_GROUP_ICON': global_configs.get('group_icon', 'fas fa-box'),
        'DEFAULT_GROUP_COLLAPSED': global_configs.get('group_collapsed', 'false'),
        'DEFAULT_TITLE': global_configs.get('title', 'Traefik Routers'),
        'DEFAULT_ROUTER_ICON': global_configs.get('router_icon', 'fas fa-bars'),
        'DEFAULT_PROTOCOL': global_configs.get('entrypoint', 'http'),
        'DEFAULT_TARGET': global_configs.get('target', '_blank'),
    }


def load_yaml(file_path):
    with open(file_path, 'r') as file:
        return yaml.safe_load(file)

def merge_colors(default_colors, user_colors):
    for mode in default_colors:
        if mode in user_colors:
            default_colors[mode].update(user_colors[mode])
    return default_colors

def categorize_configs(config):
    for key, value in config.items():
        if key == "routers":
            router_configs.update(value)
        elif key == "groups":
            group_configs.update(value)
        elif key == "global":
            global_configs.update(value)

def fetch_containers():
    containers = client.containers.list(all=True)
    for container in containers:
        labels = container.attrs.get('Config', {}).get('Labels', {})
        for label, value in labels.items():
            if label.startswith('traefik-frontend.http.routers.'):
                router_name = label.split('.')[3]
                if router_name not in router_configs:
                    router_configs[router_name] = {}
                key = label.split('.')[4]
                router_configs[router_name][key] = value
            elif label.startswith('traefik-frontend.groups.'):
                group_name = label.split('.')[2]
                if group_name not in group_configs:
                    group_configs[group_name] = {}
                key = label.split('.')[3]
                group_configs[group_name][key] = value
            elif label.startswith('traefik-frontend.'):
                key = label.split('.')[1]
                global_configs[key] = value

def get_routers(defaults):
    response = requests.get(TRAEFIK_API_URL, verify=False)  # Ignore SSL certificate verification
    if response.status_code == 200:
        routers = response.json()
        filtered_routers = filter_routers(routers, defaults)
        return filtered_routers
    return []

def filter_routers(routers, defaults):
    filtered_routers = []
    for router in routers:
        for pattern in defaults["REGEX_PATTERNS"]:
            if re.match(pattern, router['rule'].split('`')[1]):
                if not is_router_hidden(router['name']):
                    router_name = router['name'].split('@')[0]
                    router['description'] = router_configs.get(router_name, {}).get('description', False)
                    router['display_name'] = router_configs.get(router_name, {}).get('router_name', router_name).upper()
                    router['icon'] = router_configs.get(router_name, {}).get('icon', defaults['DEFAULT_ROUTER_ICON'])
                    router['group'] = router_configs.get(router_name, {}).get('group', defaults['DEFAULT_GROUP'])
                    router['protocol'] = router_configs.get(router_name, {}).get('entrypoint', defaults['DEFAULT_PROTOCOL'])
                    router['target'] = router_configs.get(router_name, {}).get('target', defaults['DEFAULT_TARGET'])
                    filtered_routers.append(router)
                break
    return filtered_routers

def is_router_hidden(router_name):
    service_name = router_name.split('@')[0]
    return router_configs.get(service_name, {}).get('hidden') == 'true'

def get_groups(defaults):
    groups = {
        defaults['DEFAULT_GROUP']: {
            'priority': int(defaults['DEFAULT_GROUP_PRIORITY']),
            'collapsed': defaults['DEFAULT_GROUP_COLLAPSED'].lower() == 'true' if isinstance(defaults['DEFAULT_GROUP_COLLAPSED'], str) else defaults['DEFAULT_GROUP_COLLAPSED'],
            'routers': [],
            'icon': defaults['DEFAULT_GROUP_ICON']
        }
    }
    
    for group_name, config in group_configs.items():
        groups[group_name] = {
            'priority': int(config.get('priority', defaults['DEFAULT_GROUP_PRIORITY'])),
            'collapsed': config.get('collapsed', defaults["DEFAULT_GROUP_COLLAPSED"]).lower() == 'true' if isinstance(config.get('collapsed', defaults["DEFAULT_GROUP_COLLAPSED"]), str) else config.get('collapsed', defaults["DEFAULT_GROUP_COLLAPSED"]),
            'routers': [],
            'icon': config.get('icon', defaults['DEFAULT_GROUP_ICON'])
        }
    
    return groups

@app.route('/static/css/colors.css')
def colors_css():
    DEFAULT_COLORS_FILE = '/app/colors.yml'
    default_colors = load_yaml(DEFAULT_COLORS_FILE)
    if os.path.exists(USER_COLORS_FILE) and USER_COLORS_FILE:
        user_colors = load_yaml(USER_COLORS_FILE)
        merged_colors = merge_colors(default_colors["colors"], user_colors["colors"])
    else:
        merged_colors = default_colors["colors"]
    return render_template('colors.css', colors=merged_colors), {'Content-Type': 'text/css'}


@app.route('/')
def index():
    if os.path.exists(USER_CONFIG_FILE) and USER_CONFIG_FILE:
        user_config = load_yaml(USER_CONFIG_FILE)
        categorize_configs(user_config.get("config", {}))
    fetch_containers()
    defaults = get_defaults(global_configs)
    title = defaults["DEFAULT_TITLE"]
    routers = get_routers(defaults)
    groups = get_groups(defaults)
    for router in routers:
        group_name = router['group']
        if group_name not in groups:
            group_name = DEFAULT_GROUP
        groups[group_name]['routers'].append(router)
    sorted_groups = {k: v for k, v in sorted(groups.items(), key=lambda item: item[1]['priority']) if v['routers']}
    return render_template('index.html', title=title, groups=sorted_groups)

if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000)
