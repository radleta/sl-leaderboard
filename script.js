const API_URL = 'https://api.splinterlands.com/players/rebellion_presale_leaders';
let previousData = null;

function fetchLeaderboardData() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            updateLeaderboard(data);
            previousData = data;
        })
        .catch(error => console.error('Error fetching leaderboard data:', error));
}

function getRankClass(rank) {
    if (rank < 6) {
        return 'rank-1-6';
    } else if (rank < 30) {
        return 'rank-7-30';
    } else if (rank < 100) {
        return 'rank-31-100';
    } else if (rank < 300) {
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
            if (Math.abs(rankChange) >= 1) { // Change this to adjust the threshold for movements
                const movementElement = document.createElement('li');
                movementElement.textContent = `${player.player} moved ${rankChange > 0 ? 'up' : 'down'} ${Math.abs(rankChange)} places`;
                movementsList.appendChild(movementElement);
            }

            if (previousPlayer && previousPlayer.total_packs !== player.total_packs) {
                playerElement.classList.add('updated');
            }
        }

        playersList.appendChild(playerElement);
    });
}

// Initial fetch
fetchLeaderboardData();

// Poll for updates every 5 seconds
setInterval(fetchLeaderboardData, 5000);
