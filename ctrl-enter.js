/**
 * Ctrl+Enter для отправки ответа
 */
(function () {
    'use strict';

    // Кликает первую кнопку, чей текст совпадает
    function clickByText(text) {
        for (const btn of document.querySelectorAll('button')) {
            if (btn.textContent.replace(/\s+/g, ' ').trim() === text) {
                btn.click();
                return;
            }
        }
    }
    
    // Кликаем при нажатии Ctrl+Enter
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            clickByText('Ответить');
            clickByText('Пройти далее');
            clickByText('Завершить выполнение') // последняя задача модуля
        }
    }, true);
})();