let initialWindowHeight;

document.addEventListener("DOMContentLoaded", function() {
    initialWindowHeight = window.innerHeight;

    if (localStorage.getItem("dark-mode") === "true") {
        document.body.classList.add("dark-mode");
        document.getElementById('theme-icon').classList.remove('fa-moon');
        document.getElementById('theme-icon').classList.add('fa-sun');
    } else {
        document.getElementById('theme-icon').classList.remove('fa-sun');
        document.getElementById('theme-icon').classList.add('fa-moon');
    }

    if (localStorage.getItem("view-mode") === "list") {
        document.body.classList.add("list-mode");
        document.getElementById('view-mode-icon').classList.remove('fa-list');
        document.getElementById('view-mode-icon').classList.add('fa-table');
    } else {
        document.getElementById('view-mode-icon').classList.remove('fa-table');
        document.getElementById('view-mode-icon').classList.add('fa-list');
    }

    document.querySelectorAll('.group').forEach(group => {
        const groupName = group.id;
        const collapsed = group.dataset.collapsed === 'true';
        if (collapsed) {
            group.classList.add('collapsed');
        } else if (localStorage.getItem(`collapsed-${groupName}`) === 'true') {
            group.classList.add('collapsed');
        }
    });

    document.addEventListener("click", function(event) {
        const settingsMenu = document.getElementById('settings-menu');
        if (!settingsMenu.contains(event.target) && !event.target.closest('.icon-button')) {
            settingsMenu.classList.remove('visible');
        }
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keydown', handleKeyDown);

    document.addEventListener('keydown', function(event) {
        if (event.key === '/') {
            event.preventDefault();
            searchInput.focus();
        }
        if (event.key === 'Escape' || event.key === 'Esc') {
            event.preventDefault();
            clearSearch();
            searchInput.blur();
        }
    });

    window.visualViewport.addEventListener('resize', adjustFooterPosition);
});

function searchFocus() {
    document.getElementById('search-input').focus()
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const themeIcon = document.getElementById('theme-icon');
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("dark-mode", "true");
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        localStorage.setItem("dark-mode", "false");
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

function toggleGroup(group) {
    const groupElement = document.getElementById(group);
    groupElement.classList.toggle("collapsed");
    const isCollapsed = groupElement.classList.contains("collapsed");
    localStorage.setItem(`collapsed-${group}`, isCollapsed);
}

function toggleSettings() {
    const settingsMenu = document.getElementById('settings-menu');
    settingsMenu.classList.toggle('visible');
}

function refreshData() {
    location.reload();
}

function toggleViewMode() {
    document.body.classList.toggle("list-mode");
    const viewModeIcon = document.getElementById('view-mode-icon');
    if (document.body.classList.contains("list-mode")) {
        localStorage.setItem("view-mode", "list");
        viewModeIcon.classList.remove('fa-list');
        viewModeIcon.classList.add('fa-table');
    } else {
        localStorage.setItem("view-mode", "box");
        viewModeIcon.classList.remove('fa-table');
        viewModeIcon.classList.add('fa-list');
    }
}

let selectedRouterIndex = -1;

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const groups = document.querySelectorAll('.group');
    const content = document.getElementById('content');

    // Remove the search group if it exists
    let searchGroup = document.getElementById('search-group');
    if (searchGroup) {
        searchGroup.remove();
    }

    if (query === '') {
        // Show all original groups
        groups.forEach(group => group.style.display = '');
        selectedRouterIndex = -1;
    } else {
        // Hide all original groups
        groups.forEach(group => group.style.display = 'none');

        // Create and show the search group
        searchGroup = document.createElement('div');
        searchGroup.id = 'search-group';
        searchGroup.className = 'group';
        content.appendChild(searchGroup);

        searchGroup.innerHTML = `
            <h2 class="group-title"><i class="fas fa-search"></i> ${query}</h2>
            <div class="router-container"></div>
        `;

        const routerContainer = searchGroup.querySelector('.router-container');
        const matchingRouters = [];

        document.querySelectorAll('.router').forEach(router => {
            const displayName = router.querySelector('h2').textContent.toLowerCase();
            if (displayName.includes(query)) {
                const clonedRouter = router.cloneNode(true);
                matchingRouters.push(clonedRouter);
                routerContainer.appendChild(clonedRouter);
            }
        });

        if (matchingRouters.length > 0) {
            selectedRouterIndex = 0;
            matchingRouters[selectedRouterIndex].classList.add('selected');
        }

        // Scroll to search group
        document.getElementById("header").scrollIntoView({ behavior: "instant" });
    }
}

function handleKeyDown(event) {
    const searchGroup = document.getElementById('search-group');
    if (!searchGroup) return;

    const matchingRouters = searchGroup.querySelectorAll('.router');
    if (matchingRouters.length === 0) return;

    const isListMode = document.body.classList.contains('list-mode');
    const itemsPerRow = getItemsPerRow();

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            if (isListMode) {
                if (selectedRouterIndex < matchingRouters.length - 1) {
                    matchingRouters[selectedRouterIndex].classList.remove('selected');
                    selectedRouterIndex++;
                    matchingRouters[selectedRouterIndex].classList.add('selected');
                    matchingRouters[selectedRouterIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                if (selectedRouterIndex + itemsPerRow < matchingRouters.length) {
                    matchingRouters[selectedRouterIndex].classList.remove('selected');
                    selectedRouterIndex += itemsPerRow;
                    matchingRouters[selectedRouterIndex].classList.add('selected');
                    matchingRouters[selectedRouterIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            break;
        case 'ArrowUp':
            event.preventDefault();
            if (isListMode) {
                if (selectedRouterIndex > 0) {
                    matchingRouters[selectedRouterIndex].classList.remove('selected');
                    selectedRouterIndex--;
                    matchingRouters[selectedRouterIndex].classList.add('selected');
                    matchingRouters[selectedRouterIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                if (selectedRouterIndex - itemsPerRow >= 0) {
                    matchingRouters[selectedRouterIndex].classList.remove('selected');
                    selectedRouterIndex -= itemsPerRow;
                    matchingRouters[selectedRouterIndex].classList.add('selected');
                    matchingRouters[selectedRouterIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            break;
        case 'ArrowRight':
            if (!isListMode) {
                event.preventDefault();
                if (selectedRouterIndex < matchingRouters.length - 1) {
                    matchingRouters[selectedRouterIndex].classList.remove('selected');
                    selectedRouterIndex++;
                    matchingRouters[selectedRouterIndex].classList.add('selected');
                    matchingRouters[selectedRouterIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            break;
        case 'ArrowLeft':
            if (!isListMode) {
                event.preventDefault();
                if (selectedRouterIndex > 0) {
                    matchingRouters[selectedRouterIndex].classList.remove('selected');
                    selectedRouterIndex--;
                    matchingRouters[selectedRouterIndex].classList.add('selected');
                    matchingRouters[selectedRouterIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            break;
        case 'Enter':
            event.preventDefault();
            if (selectedRouterIndex >= 0 && selectedRouterIndex < matchingRouters.length) {
                matchingRouters[selectedRouterIndex].click();
            }
            break;
    }
}

function getItemsPerRow() {
    const width = window.innerWidth;
    if (width <= 480) return 1;
    if (width <= 1024) return 2;
    return 3;
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    handleSearch({ target: searchInput });
}

function adjustFooterPosition() {
    const footer = document.querySelector('.footer');
    const visualViewportHeight = window.visualViewport.height;
    const bottomOffset = window.innerHeight - visualViewportHeight;

    // Set the bottom position
    footer.style.bottom = `${bottomOffset}px`;
}

