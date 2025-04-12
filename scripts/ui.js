'use strict';

// ========================
// UI COMPONENTS
// ========================

/**
 * Creates a menu item in the dropdown menu
 */
function createMenuItem(dropdownMenu, text, callback) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menuItem';
    menuItem.target = '_blank';
    menuItem.textContent = text;
    
    Object.assign(menuItem.style, {
        padding: '10px 20px',
        textDecoration: 'none',
        color: colors.menuItemColor,
        display: 'block',
        cursor: 'pointer'
    });
    
    menuItem.addEventListener('mouseover', () => {
        menuItem.style.backgroundColor = colors.menuBackgroundHoverColor;
    });
    
    menuItem.addEventListener('mouseout', () => {
        menuItem.style.backgroundColor = colors.menuBackgroundColor;
    });
    
    if (callback) {
        menuItem.addEventListener('click', callback);
    }
    
    dropdownMenu.appendChild(menuItem);
}

/**
 * Creates the main budgeting button and dropdown container
 */
function createMenuButtonAndContainer(buttonLabel) {
    try {
        const menuButton = document.createElement('button');
        menuButton.id = 'menuButton';
        menuButton.textContent = buttonLabel;
        document.body.appendChild(menuButton);

        // Style the menu button
        Object.assign(menuButton.style, {
            position: 'fixed',
            top: '90px',
            right: '10px',
            padding: '10px 20px',
            backgroundColor: colors.menuButtonBackgroundColor,
            color: colors.menuButtonColor,
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: '99999'
        });

        // Create the dropdown menu container
        const dropdownMenu = document.createElement('div');
        dropdownMenu.id = 'dropdownMenu';
        document.body.appendChild(dropdownMenu);

        // Style the dropdown menu
        Object.assign(dropdownMenu.style, {
            display: 'none',
            position: 'fixed',
            top: '130px',
            right: '10px',
            backgroundColor: colors.menuBackgroundColor,
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            zIndex: '99999'
        });

        // Close the dropdown if the user clicks outside of it
        window.addEventListener('click', function(event) {
            if (!event.target.matches(`#${menuButton.id}`)) {
                if (dropdownMenu.style.display === 'block') {
                    dropdownMenu.style.display = 'none';
                }
            }
        });

        // Handle menu button click
        menuButton.addEventListener('click', function() {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        return dropdownMenu;
    } catch (error) {
        console.error('Error creating menu:', error);
        return null;
    }
}

/**
 * Creates a copy icon SVG element
 */
function createCopyIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cursor = 'pointer';

    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect1.setAttribute("x", "9");
    rect1.setAttribute("y", "9");
    rect1.setAttribute("width", "13");
    rect1.setAttribute("height", "13");
    rect1.setAttribute("rx", "2");
    rect1.setAttribute("ry", "2");
    svg.appendChild(rect1);

    const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line1.setAttribute("x1", "5");
    line1.setAttribute("y1", "5");
    line1.setAttribute("x2", "5");
    line1.setAttribute("y2", "18");
    line1.setAttribute("stroke", "currentColor");
    line1.setAttribute("stroke-width", "2");
    svg.appendChild(line1);

    const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line2.setAttribute("x1", "5");
    line2.setAttribute("y1", "5");
    line2.setAttribute("x2", "18");
    line2.setAttribute("y2", "5");
    line2.setAttribute("stroke", "currentColor");
    line2.setAttribute("stroke-width", "2");
    svg.appendChild(line2);

    return svg;
}
