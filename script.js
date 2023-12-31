const API_URL = 'https://api.splinterlands.com/players/rebellion_presale_leaders';
let previousData = null;
let pollingInterval = null;
let hasFetchedAfterEndDate = false;

const END_DATE = new Date('2023-11-17T13:00:00-05:00'); // End date in EST

function fetchLeaderboardData() {
    const currentDate = new Date();
    if (currentDate >= END_DATE) {
        if (hasFetchedAfterEndDate) {
            clearInterval(pollingInterval); // Stop polling for data

			// Add end message to the movements list
			const movementsList = document.getElementById('movements-list');
			const endMessageElement = document.createElement('li');
			endMessageElement.textContent = 'The Splinterlands Rebellion Presale has ended.';
			movementsList.insertBefore(endMessageElement, movementsList.firstChild);

            return;
        } else {
            hasFetchedAfterEndDate = true;
        }	
    }

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            updateLeaderboard(data);
            previousData = data;
        })
        .catch(error => console.error('Error fetching leaderboard data:', error));
}

function getRankClass(rank) {
    if (rank <= 6) {
        return 'rank-1-6';
    } else if (rank <= 30) {
        return 'rank-7-30';
    } else if (rank <= 100) {
        return 'rank-31-100';
    } else if (rank <= 300) {
        return 'rank-101-300';
    } else {
        return 'rank-300-plus';
    }
}

function getRankChange(previousRank, currentRank) {
    if (previousRank > 0 && currentRank > 0) {
        return previousRank - currentRank;
    } else {
        return -currentRank; // Negative because the player has moved down from not being on the leaderboard
    }
}

function updateLeaderboard(data) {
    const playersList = document.getElementById('players-list');
    const movementsList = document.getElementById('movements-list');
    playersList.innerHTML = '';

    const totalPacks = data.total_packs_purchased + data.total_bonus_packs; // Calculate total packs from root data
	const remainingPacks = 500000 - totalPacks; // Calculate remaining packs

    data.players.forEach((player, index) => {
        const playerElement = document.createElement('li');
        playerElement.textContent = `${index + 1}. ${player.player}: ${player.total_packs} packs`;

        // Add rank class
        playerElement.classList.add(getRankClass(index + 1));

        // Check for changes
        if (previousData) {
            const previousPlayer = previousData.players.find(p => p.player === player.player);
            const previousIndex = previousPlayer ? previousData.players.indexOf(previousPlayer) + 1 : -1;
            const rankChange = getRankChange(previousIndex, index + 1);
            const packDelta = previousPlayer ? player.total_packs - previousPlayer.total_packs : player.total_packs; // Calculate pack delta
            if (Math.abs(rankChange) >= 1 && packDelta > 0) { // Check if packDelta is greater than 0
                const movementElement = document.createElement('li');
                movementElement.textContent = `${player.player} moved from rank ${previousIndex} to ${index + 1} with a pack delta of ${packDelta}`;

                // Add color for big movements
                movementElement.classList.add(getRankClass(index + 1)); // Add the rank class based on the new rank

                movementsList.insertBefore(movementElement, movementsList.firstChild);
            }

            if (previousPlayer && player.total_packs !== previousPlayer.total_packs) {
                playerElement.classList.add('updated');
            }
        }

        playersList.appendChild(playerElement);
    });

    // Add total packs to the leaderboard
    const totalPacksElement = document.createElement('li');
    totalPacksElement.textContent = `Total packs purchased: ${data.total_packs_purchased}, Total bonus packs: ${data.total_bonus_packs}, Total packs: ${totalPacks}, Remaining packs: ${remainingPacks}`;    
    movementsList.insertBefore(totalPacksElement, movementsList.firstChild);
}

// Initial fetch
fetchLeaderboardData();

// Poll for updates every 5 seconds
pollingInterval = setInterval(fetchLeaderboardData, 5000);
