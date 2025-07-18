// Quest Board Widget Script
document.addEventListener('DOMContentLoaded', () => {
    const widgetMainButton = document.getElementById('widgetMainButton');
    const widgetSubButtons = document.getElementById('widgetSubButtons');
    const openQuestsBoardBtn = document.getElementById('openQuestsBoardBtn');
    const openAddQuestBtn = document.getElementById('openAddQuestBtn');
    const questIframeOverlay = document.getElementById('questIframeOverlay');
    const questIframe = document.getElementById('questIframe');
    const iframeCloseButton = document.getElementById('iframeCloseButton');

    if (widgetMainButton) {
        widgetMainButton.addEventListener('click', (event) => {
            event.stopPropagation();
            widgetSubButtons.classList.toggle('active');
        });
    }

    if (openQuestsBoardBtn) {
        openQuestsBoardBtn.addEventListener('click', () => {
            questIframe.src = '/quests-board'; // URL for the quests board page
            questIframeOverlay.classList.add('active');
        });
    }

    if (openAddQuestBtn) {
        openAddQuestBtn.addEventListener('click', () => {
            questIframe.src = '/add-quest'; // URL for the add quest page
            questIframeOverlay.classList.add('active');
        });
    }

    if (iframeCloseButton) {
        iframeCloseButton.addEventListener('click', () => {
            questIframeOverlay.classList.remove('active');
            questIframe.src = ''; // Clear src to stop video/audio playback
        });
    }

    document.addEventListener('click', (event) => {
        if (widgetMainButton && !widgetMainButton.contains(event.target) && widgetSubButtons && !widgetSubButtons.contains(event.target)) {
            widgetSubButtons.classList.remove('active');
        }
        if (questIframeOverlay && event.target === questIframeOverlay) {
            questIframeOverlay.classList.remove('active');
            questIframe.src = '';
        }
    });
});
