# Traefik Frontend

This application is a web dashboard for visualizing Traefik routers. It retrieves router information from the Traefik API and displays it in a user-friendly interface. The application supports customization through configuration files, Docker labels, and environment variables.

## Features

- Visualizes Traefik routers with customizable icons, descriptions, and grouping.
- Supports global, group, and router-specific configurations.
- Configurable via YAML files and Docker labels.
- Supports theming with customizable color schemes.

## Requirements

- Docker
- Traefik

## Installation

### Create your folder structure

```sh
mkdir traefik-frontend
cd traefik-frontend
mkdir data
```

### Add the Optional Configuration Files

- `data/theme.yml` (for default color schemes)
- `data/config.yml` (for default configurations)

### Create the `docker-compose.yml` File

```yaml
services:
  traefik-frontend:
    container_name: traefik-frontend
    image: ghcr.io/fluzzi/traefik-frontend:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./data:/data
    environment:
      - PUID=1000
      - PGID=1000
      - TRAEFIK_API_URL=your-traefik-api-url  # Example: traefik.home/api/http/routers
      - USER_CONFIG_FILE=/data/config.yml     # Optional
      - USER_COLORS_FILE=/data/theme.yml     # Optional
```

### Build and Run the Docker Container

```sh
docker compose up
```

## Configuration

### Environment Variables

- `TRAEFIK_API_URL` (required): URL of the Traefik Routers API.
- `USER_CONFIG_FILE` (optional): Path to the user-provided configuration YAML file.
- `USER_COLORS_FILE` (optional): Path to the user-provided colors YAML file.

### Configuration Files

#### `config.yml`

- `config`:
  - `routers`: Router-specific configurations.
    - `router_name`:
      - `description`: Description of the router.
      - `router_name`: Display name of the router.
      - `icon`: Icon for the router.
      - `group`: Group to which the router belongs.
      - `entrypoint`: Protocol for the router link (e.g., http, https).
      - `target`: Target for the router link (e.g., _blank, _self).
      - `hidden`: Whether the router is hidden.
  - `groups`: Group-specific configurations.
    - `group_name`:
      - `priority`: Priority of the group.
      - `collapsed`: Collapsed state of the group.
      - `icon`: Icon for the group.
  - `global`: Global configurations.
    - `title`: Title of the application.
    - `default_group`: Default group name for routers.
    - `default_group_priority`: Default priority for the groups.
    - `default_group_icon`: Default icon for the groups.
    - `default_group_collapsed`: Default collapsed state for the groups.
    - `default_router_icon`: Default icon for the routers.
    - `default_protocol`: Default protocol for router links (e.g., http, https).
    - `default_target`: Default target for router links (e.g., _blank, _self).
    - `regex_patterns`: List of regex patterns to filter routers.

#### Example

```yaml
config:
  routers:
    my_router:
      description: "My Router Description"
      router_name: "MY_ROUTER"
      icon: "fas fa-route"
      group: "My Group"
      entrypoint: "https"
      target: "_self"
      hidden: false
  groups:
    MyGroup:
      priority: 10
      collapsed: true
      icon: "fas fa-box"
  global:
    title: "Traefik Routers Dashboard"
    default_group: "Applications"
    default_group_priority: 100
    default_group_icon: "fas fa-box"
    default_group_collapsed: false
    default_router_icon: "fas fa-bars"
    default_protocol: "http"
    default_target: "_blank"
    regex_patterns:
      - ".*"
```

### Docker Labels

- `traefik-frontend.http.routers.<router_name>.description`: Description of the router.
- `traefik-frontend.http.routers.<router_name>.router_name`: Display name of the router.
- `traefik-frontend.http.routers.<router_name>.icon`: Icon for the router.
- `traefik-frontend.http.routers.<router_name>.group`: Group to which the router belongs.
- `traefik-frontend.http.routers.<router_name>.entrypoint`: Protocol for the router link (e.g., http, https).
- `traefik-frontend.http.routers.<router_name>.target`: Target for the router link (e.g., _blank, _self).
- `traefik-frontend.http.routers.<router_name>.hidden`: Whether the router is hidden.
- `traefik-frontend.groups.<group_name>.priority`: Priority of the group.
- `traefik-frontend.groups.<group_name>.collapsed`: Collapsed state of the group.
- `traefik-frontend.groups.<group_name>.icon`: Icon for the group.
- `traefik-frontend.title`: Title of the application.
- `traefik-frontend.default_group`: Default group name for routers.
- `traefik-frontend.default_group_priority`: Default priority for the groups.
- `traefik-frontend.default_group_icon`: Default icon for the groups.
- `traefik-frontend.default_group_collapsed`: Default collapsed state for the groups.
- `traefik-frontend.default_router_icon`: Default icon for the routers.
- `traefik-frontend.default_protocol`: Default protocol for router links (e.g., http, https).
- `traefik-frontend.default_target`: Default target for router links (e.g., _blank, _self).
- `traefik-frontend.regex_patterns`: List of regex patterns to filter routers.

## Color Customization

You can modify the following color variables to customize the appearance of the application. These variables can be defined in the `theme.yml` file.

### Light Mode Colors

- `--light-background`: Background color of the body
- `--light-title-text`: Text color of the body
- `--light-header-bg`: Background color of the header (default is `--light-accent`)
- `--light-icons`: Icon color of the buttons
- `--light-icon-bg`: Background color of the icon button
- `--light-border`: Border color of the icon button (default is `--light-accent`)
- `--light-icon-hover-bg`: Background color of the icon button on hover
- `--light-group-text`: Text color of group titles (default is `--light-accent`)
- `--light-router-bg`: Background color of routers
- `--light-router-text`: Text color of routers
- `--light-router-hover-shadow`: Shadow color of routers on hover
- `--light-router-title`: Title color of routers (default is `--light-accent`)
- `--light-footer-bg`: Background color of the footer (default is `--light-accent`)
- `--light-search-bar-bg`: Background color of the search bar
- `--light-search-bar-icon`: Icon color of the search bar (default is `--light-accent`)
- `--light-search-bar-input`: Input text color of the search bar (default is `--light-accent`)
- `--light-selected-router-border`: Border color of the selected router (default is `--light-accent`)

### Dark Mode Colors

- `--dark-background`: Background color of the body
- `--dark-title-text`: Text color of the body
- `--dark-header-bg`: Background color of the header (default is `--dark-accent`)
- `--dark-icons`: Icon color of the buttons
- `--dark-icon-bg`: Background color of the icon button
- `--dark-border`: Border color of the icon button (default is `--dark-accent`)
- `--dark-icon-hover-bg`: Background color of the icon button on hover
- `--dark-group-text`: Text color of group titles (default is `--dark-accent`)
- `--dark-router-bg`: Background color of routers
- `--dark-router-text`: Text color of routers
- `--dark-router-hover-shadow`: Shadow color of routers on hover
- `--dark-router-title`: Title color of routers (default is `--dark-accent`)
- `--dark-footer-bg`: Background color of the footer
- `--dark-search-bar-bg`: Background color of the search bar
- `--dark-search-bar-icon`: Icon color of the search bar (default is `--dark-accent`)
- `--dark-search-bar-input`: Input text color of the search bar (default is `--dark-accent`)
- `--dark-selected-router-border`: Border color of the selected router (default is `--dark-accent`)

You can define these variables in the `theme.yml` file like this:

```yaml
colors:
  light:
    background: "#f0f0f0"
    title-text: "#e0e0e0"
    icons: "#333"
    header-bg: "#3f51b5"
    accent: "#3f51b5"
  dark:
    background: "#121212"
    title-text: "#e0e0e0"
    icons: "#e0e0e0"
    header-bg: "#1e1e1e"
    accent: "#bb86fc"
```

## Usage

1. **Start the application:**

   ```sh
   docker compose up
   ```

2. **Access the web interface:**

   Open your browser and navigate to `http://<your-docker-host-ip>:5000`.

## Application Overview

### Application Structure

```plaintext
project-root/
├── Dockerfile
├── README.md
├── LICENSE
└── app/
    ├── app.py
    ├── colors.yml
    ├── requirements.txt
    ├── templates/
    │   ├── index.html
    │   └── colors.css
    └── static/
        ├── css/
        │   ├── styles.css
        │   └── components.css
        └── js/
            ├── scripts.js
            └── fontawesome.js
```

### Main Components

- **`app/app.py`**: Main application file.
- **`app/colors.yml`**: Default color scheme file.
- **`app/templates/index.html`**: Main HTML template.
- **`app/templates/colors.css`**: Main CSS colors template.
- **`app/static/css/styles.css`**: Main CSS file.
- **`app/static/css/components.css`**: Components CSS file.
- **`app/static/js/scripts.js`**: Main JavaScript file.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
