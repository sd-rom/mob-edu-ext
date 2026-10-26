/**
 * Hазблокировка пунктов навигации
 *
 * Снимает aria-disabled и классы *_disabled_ с ссылок, чтобы можно было
 * переходить в закрытые разделы. React постоянно перерисовывает ссылки,
 * поэтому работаем через MutationObserver. Если React всё же отменяет клик
 * (preventDefault), переходим по href принудительно.
 */
(function () {
    'use strict';

    // Селектор «заблокированных» ссылок: либо aria-disabled, либо класс с _disabled_
    const SEL = 'a[aria-disabled="true"], a[class*="_disabled_"]';

    // Снимает блокировку с конкретной ссылки (идемпотентно)
    function unlock(a) {
        if (!a || a.dataset.unlocked) return;
        a.dataset.unlocked = '1';                    // помечаем, чтобы не обрабатывать повторно
        a.removeAttribute('aria-disabled');
        a.setAttribute('tabindex', '0');

        // Удаляем классы блокировки (копируем в массив, т.к. classList мутируется)
        [...a.classList].forEach(c => {
            if (c.includes('_disabled_')) a.classList.remove(c);
        });
    }

    // Первичный проход по уже отрисованным элементам
    document.querySelectorAll(SEL).forEach(unlock);

    // Следим за изменениями DOM: React перерисовывает ссылки постоянно
    new MutationObserver(muts => {
        muts.forEach(m => {
            // Ссылку разблокировали -> React вернул aria-disabled/class -> разблокируем снова
            if (m.type === 'attributes' && m.target.matches(SEL)) {
                unlock(m.target);
            } else if (m.type === 'childList') {
                // Появились новые узлы -> ищем заблокированные ссылки среди них и внутри
                m.addedNodes.forEach(n => {
                    if (n.nodeType === 1) {
                        if (n.matches(SEL)) unlock(n);
                        n.querySelectorAll(SEL).forEach(unlock);
                    }
                });
            }
        });
    }).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-disabled', 'class']
    });

    // Перехват клика: ждём, пока React отменит его через preventDefault,
    // и если это случилось — переходим по href вручную
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-unlocked="1"]');
        if (a) {
            setTimeout(() => {
                if (e.defaultPrevented && a.href) window.location.assign(a.href);
            }, 0);
        }
    }, true);
})();