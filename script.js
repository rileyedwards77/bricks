// Define items at global scope
let items = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Check if we have items in localStorage first
    const savedItems = localStorage.getItem('wantedList');
    if (savedItems) {
        try {
            items = JSON.parse(savedItems);
            console.log('Loaded items from localStorage:', items);
            renderItems(items);
        } catch (e) {
            console.error('Error parsing saved items:', e);
            fetchItemsFromJson();
        }
    } else {
        fetchItemsFromJson();
    }

    function fetchItemsFromJson() {
        fetch('wantedList.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Successfully loaded items from JSON file:', data);
                items = data;
                renderItems(items);
            })
            .catch(error => {
                console.error('Error loading items:', error);
            });
    }

    function renderItems(items) {
        const itemList = document.getElementById('item-list');
        itemList.innerHTML = ''; // Clear existing items
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.dataset.id = item.id;
            li.className = item.status || 'pending';
            
            li.innerHTML = `
                <span class="item-id">${item.id}</span>
                <span class="item-description">${item.name}</span>
                <span class="item-qty">Qty: ${item.minQty}</span>
                <span class="item-remarks">${item.remarks}</span>
                <div class="item-actions">
                    <button class="copy-id" onclick="copyItemId('${item.id}')">Copy ID</button>
                    <button class="copy-remarks" onclick="copyRemarks('${item.remarks.replace(/'/g, "\\'")}')">Copy Remarks</button>
                    <div class="status-buttons">
                        <button class="wishlist-btn ${item.status === 'wishlisted' ? 'active' : ''}" 
                                onclick="toggleWishlist('${item.id}')">Wishlist</button>
                        <button class="ordered-btn ${item.status === 'ordered' ? 'active' : ''}" 
                                onclick="toggleOrdered('${item.id}')">Ordered</button>
                        <button class="received-btn ${item.status === 'received' ? 'active' : ''}"
                                onclick="toggleReceived('${item.id}')">Received</button>
                        <button class="used-btn ${item.status === 'used' ? 'active' : ''}"
                                onclick="toggleUsed('${item.id}')">Used</button>
                    </div>
                </div>
            `;
            itemList.appendChild(li);
        });

        // Function to toggle wishlist status
        window.toggleWishlist = function(itemId) {
            const item = items.find(item => item.id === itemId);
            const listItem = document.querySelector(`li[data-id="${itemId}"]`);
            const wishlistBtn = listItem.querySelector('.wishlist-btn');
            const orderedBtn = listItem.querySelector('.ordered-btn');
            
            if (item) {
                if (item.status === 'wishlisted') {
                    // Unmark from wishlist
                    item.status = 'pending';
                    listItem.className = 'pending';
                    wishlistBtn.classList.remove('active');
                } else {
                    // Mark as wishlisted
                    item.status = 'wishlisted';
                    listItem.className = 'wishlisted';
                    wishlistBtn.classList.add('active');
                    orderedBtn.classList.remove('active');
                    listItem.querySelector('.received-btn').classList.remove('active');
                    listItem.querySelector('.used-btn').classList.remove('active');
                }
                
                updateJson(items);
            }
        };

        // Function to toggle ordered status
        window.toggleOrdered = function(itemId) {
            const item = items.find(item => item.id === itemId);
            const listItem = document.querySelector(`li[data-id="${itemId}"]`);
            const wishlistBtn = listItem.querySelector('.wishlist-btn');
            const orderedBtn = listItem.querySelector('.ordered-btn');
            
            if (item) {
                if (item.status === 'ordered') {
                    // Unmark from ordered
                    item.status = 'pending';
                    listItem.className = 'pending';
                    orderedBtn.classList.remove('active');
                } else {
                    // Mark as ordered
                    item.status = 'ordered';
                    listItem.className = 'ordered';
                    orderedBtn.classList.add('active');
                    wishlistBtn.classList.remove('active');
                    listItem.querySelector('.received-btn').classList.remove('active');
                    listItem.querySelector('.used-btn').classList.remove('active');
                }
                
                updateJson(items);
            }
        };

        // Function to toggle received status
        window.toggleReceived = function(itemId) {
            const item = items.find(item => item.id === itemId);
            const listItem = document.querySelector(`li[data-id="${itemId}"]`);
            const receivedBtn = listItem.querySelector('.received-btn');
            console.log('[toggleReceived] Before:', JSON.stringify(item));
            if (item) {
                if (item.status === 'received') {
                    item.status = 'pending';
                    listItem.className = 'pending';
                    receivedBtn.classList.remove('active');
                } else {
                    item.status = 'received';
                    listItem.className = 'received';
                    receivedBtn.classList.add('active');
                    // Remove active from others
                    listItem.querySelector('.wishlist-btn').classList.remove('active');
                    listItem.querySelector('.ordered-btn').classList.remove('active');
                    listItem.querySelector('.used-btn').classList.remove('active');
                }
                console.log('[toggleReceived] After:', JSON.stringify(item));
                console.log('[toggleReceived] items array before updateJson:', JSON.stringify(items));
                updateJson(items);
            }
        };

        // Function to toggle used status
        window.toggleUsed = function(itemId) {
            const item = items.find(item => item.id === itemId);
            const listItem = document.querySelector(`li[data-id="${itemId}"]`);
            const usedBtn = listItem.querySelector('.used-btn');
            console.log('[toggleUsed] Before:', JSON.stringify(item));
            if (item) {
                if (item.status === 'used') {
                    item.status = 'pending';
                    listItem.className = 'pending';
                    usedBtn.classList.remove('active');
                } else {
                    item.status = 'used';
                    listItem.className = 'used';
                    usedBtn.classList.add('active');
                    // Remove active from others
                    listItem.querySelector('.wishlist-btn').classList.remove('active');
                    listItem.querySelector('.ordered-btn').classList.remove('active');
                    listItem.querySelector('.received-btn').classList.remove('active');
                }
                console.log('[toggleUsed] After:', JSON.stringify(item));
                console.log('[toggleUsed] items array before updateJson:', JSON.stringify(items));
                updateJson(items);
            }
        };

        // Function to update JSON file
        function updateJson(items) {
            fetch('http://localhost:8080/update_json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(items)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Status updated in JSON:', data);
                // Fetch the updated JSON and re-render the list
                fetch('wantedList.json?' + Date.now()) // cache-busting
                    .then(res => res.json())
                    .then(freshItems => {
                        items = freshItems;
                        renderItems(items);
                    });
            })
            .catch(error => console.error('Error updating status:', error));
        }

        // Filtering UI - only create once
        if (!document.querySelector('.filter-container')) {
            const filterContainer = document.createElement('div');
            filterContainer.className = 'filter-container';
            filterContainer.innerHTML = `
                <label for="status-filter">Filter by status:</label>
                <select id="status-filter">
                    <option value="all">All</option>
                    <option value="wishlisted">Wishlisted</option>
                    <option value="ordered">Ordered</option>
                    <option value="received">Received</option>
                    <option value="used">Used</option>
                </select>
            `;
            document.querySelector('.container').insertBefore(filterContainer, itemList);
            
            document.getElementById('status-filter').addEventListener('change', function() {
                const value = this.value;
                Array.from(itemList.children).forEach(li => {
                    if (value === 'all' || li.className === value) {
                        li.style.display = '';
                    } else {
                        li.style.display = 'none';
                    }
                });
            });
        }
    }
});

function copyItemId(itemId) {
    navigator.clipboard.writeText(itemId);
}

function copyRemarks(remarks) {
    navigator.clipboard.writeText(remarks);
}
