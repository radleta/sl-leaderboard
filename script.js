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

function updateLeaderboard(data) {
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';

    data.players.forEach((player, index) => {
        const playerElement = document.createElement('li');
        playerElement.textContent = `${player.player}: ${player.total_packs} packs`;

        // Add rank class
        playerElement.classList.add(getRankClass(index + 1));

        // Check for changes
        if (previousData) {
            const previousPlayer = previousData.players.find(p => p.player === player.player);
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
