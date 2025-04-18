document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    fetch('wantedList.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(items => {
            console.log('Successfully loaded items:', items);
            const itemList = document.getElementById('item-list');

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
                    updateJson(items);
                }
            };

            // Function to toggle used status
            window.toggleUsed = function(itemId) {
                const item = items.find(item => item.id === itemId);
                const listItem = document.querySelector(`li[data-id="${itemId}"]`);
                const usedBtn = listItem.querySelector('.used-btn');
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
                    updateJson(items);
                }
            };

            // Function to update JSON file
            function updateJson(items) {
                fetch('/update_json', {
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
                })
                .catch(error => console.error('Error updating status:', error));
            }

            // Filtering UI
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
        })
        .catch(error => {
            console.error('Error loading wanted list:', error);
            const itemList = document.getElementById('item-list');
            itemList.innerHTML = `<p style="color: red;">Error loading items: ${error.message}</p>`;
        });
});

function copyItemId(itemId) {
    navigator.clipboard.writeText(itemId);
}

function copyRemarks(remarks) {
    navigator.clipboard.writeText(remarks);
}
