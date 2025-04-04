// Ждем, пока весь HTML-документ будет полностью загружен и разобран
document.addEventListener('DOMContentLoaded', () => {

    // --- Image Generation Page Logic (Страница generate.html) ---
    const generationForm = document.getElementById('generationForm');
    const promptInput = document.getElementById('promptInput');
    const enhanceCheckbox = document.getElementById('enhanceCheckbox');
    const seedInput = document.getElementById('seedInput');
    const widthSlider = document.getElementById('widthSlider');
    const widthValueDisplay = document.getElementById('widthValueDisplay');
    const heightSlider = document.getElementById('heightSlider');
    const heightValueDisplay = document.getElementById('heightValueDisplay');
    const generateButton = document.getElementById('generateButton');
    const resultSection = document.getElementById('resultSection');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorDisplay = document.getElementById('errorDisplay');
    const imageResult = document.getElementById('imageResult');
    const generatedImage = document.getElementById('generatedImage');
    const downloadLink = document.getElementById('downloadLink');

    // Обновляем отображение значений слайдеров при их изменении
    if (widthSlider && widthValueDisplay) {
        widthValueDisplay.textContent = widthSlider.value; // Начальное значение
        widthSlider.addEventListener('input', () => {
            widthValueDisplay.textContent = widthSlider.value;
        });
    }
    if (heightSlider && heightValueDisplay) {
        heightValueDisplay.textContent = heightSlider.value; // Начальное значение
        heightSlider.addEventListener('input', () => {
            heightValueDisplay.textContent = heightSlider.value;
        });
    }

    // Обрабатываем отправку формы генерации
    if (generationForm) {
        generationForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Отменяем стандартное поведение браузера

            // --- Обновления UI: Начало загрузки ---
            resultSection.style.display = 'block';
            imageResult.style.display = 'none';
            errorDisplay.style.display = 'none';
            downloadLink.style.display = 'none';
            loadingIndicator.style.display = 'flex';
            generateButton.disabled = true;
            generateButton.textContent = 'Генерация...';

            // --- Получаем данные из формы ---
            const prompt = promptInput.value;
            const enhance = enhanceCheckbox.checked;
            const seed = seedInput.value.trim() === '' ? -1 : parseInt(seedInput.value, 10);
            const width = parseInt(widthSlider.value, 10);
            const height = parseInt(heightSlider.value, 10);

            const requestData = { prompt, enhance, seed, width, height };

            // --- Вызов API ---
            try {
                // ВАЖНО: Замените '/api/generate' на ваш реальный эндпоинт бэкенда
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    let errorMsg = `Ошибка ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error || errorMsg;
                    } catch (e) {
                        console.warn("Не удалось разобрать тело ответа с ошибкой:", e);
                    }
                    throw new Error(errorMsg);
                }

                // Ожидаем ответ в формате { "imageUrl": "..." }
                const result = await response.json();

                if (result.imageUrl) {
                    generatedImage.src = result.imageUrl;
                    downloadLink.href = result.imageUrl;
                    imageResult.style.display = 'block';
                    downloadLink.style.display = 'inline-block';
                    errorDisplay.style.display = 'none';
                } else {
                     throw new Error('Некорректный ответ от сервера: отсутствует imageUrl.');
                }

            } catch (error) {
                console.error('Ошибка при генерации изображения:', error);
                errorDisplay.textContent = `Произошла ошибка: ${error.message}`;
                errorDisplay.style.display = 'block';
                imageResult.style.display = 'none';
            } finally {
                // --- Обновления UI: Конец загрузки ---
                loadingIndicator.style.display = 'none';
                generateButton.disabled = false;
                generateButton.textContent = 'Сгенерировать';
            }
        });
    }

    // --- Model Page Filter Logic (Страница models.html) ---
    const companyFilter = document.getElementById('companyFilter');
    const modelsContainer = document.getElementById('modelsContainer');

    // Проверяем, что элементы фильтра существуют на текущей странице
    if (companyFilter && modelsContainer) {
        const modelCards = modelsContainer.querySelectorAll('.model-card'); // Получаем все карточки моделей

        const filterModels = () => {
            const selectedCompany = companyFilter.value;

            modelCards.forEach(card => {
                const cardCompany = card.getAttribute('data-company'); // Получаем компанию из data-атрибута

                // Показываем карточку если выбрано "Все" или компания совпадает
                if (selectedCompany === 'all' || cardCompany === selectedCompany) {
                    card.style.display = 'flex'; // Используем 'flex', т.к. у карточек display: flex
                } else {
                    card.style.display = 'none'; // Скрываем карточку
                }
            });
        };

        // Применяем фильтр при изменении значения в выпадающем списке
        companyFilter.addEventListener('change', filterModels);

        // Примечание: Можно вызвать filterModels() здесь один раз,
        // если начальное состояние фильтра не "Все компании"
        // filterModels();
    }


document.addEventListener('DOMContentLoaded', () => {

    // --- Логика Бургер-меню ---
    const menuToggle = document.getElementById('menuToggle');
    const mainMenu = document.getElementById('main-menu');
    const body = document.body; // Получаем body

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            // Переключаем класс is-active у кнопки
            menuToggle.classList.toggle('is-active');
            // Переключаем класс is-active у меню
            mainMenu.classList.toggle('is-active');

            // Управляем aria-expanded
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);

            // (Опционально) Блокируем скролл страницы, когда меню открыто
            if (mainMenu.classList.contains('is-active')) {
                body.style.overflow = 'hidden'; // Запретить скролл
            } else {
                body.style.overflow = ''; // Разрешить скролл
            }
        });

        // (Опционально) Закрываем меню при клике на ссылку внутри него
        mainMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainMenu.classList.contains('is-active')) {
                    menuToggle.classList.remove('is-active');
                    mainMenu.classList.remove('is-active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    body.style.overflow = ''; // Разрешить скролл
                }
            });
        });

         // (Опционально) Закрываем меню при клике вне его области
         document.addEventListener('click', (event) => {
            const isClickInsideMenu = mainMenu.contains(event.target);
            const isClickOnToggler = menuToggle.contains(event.target);

            if (!isClickInsideMenu && !isClickOnToggler && mainMenu.classList.contains('is-active')) {
                 menuToggle.classList.remove('is-active');
                 mainMenu.classList.remove('is-active');
                 menuToggle.setAttribute('aria-expanded', 'false');
                 body.style.overflow = ''; // Разрешить скролл
            }
         });
    }

    // --- Логика подсветки активного пункта меню ---
    const currentPath = window.location.pathname.split("/").pop() || 'index.html'; // Получаем имя текущего файла
    const navLinks = mainMenu ? mainMenu.querySelectorAll('a') : []; // Получаем ссылки из меню

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split("/").pop();
        // Убираем класс active у всех ссылок сначала
        link.classList.remove('active');
        // Добавляем класс active, если путь совпадает
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });


    // --- Логика анимаций при скролле (ВАШ СУЩЕСТВУЮЩИЙ КОД ИЛИ НОВЫЙ) ---
    // Пример:
    const animatedElements = document.querySelectorAll('.animated');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Определяем тип анимации из классов элемента
                let animationClass = '';
                if (entry.target.classList.contains('fadeIn')) {
                    animationClass = 'run-fadeIn';
                } else if (entry.target.classList.contains('slideInUp')) {
                    animationClass = 'run-slideInUp';
                }
                // Добавляем класс для ЗАПУСКА анимации
                if (animationClass) {
                    entry.target.classList.add(animationClass);
                }
                // Перестаем наблюдать за элементом после анимации
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Порог срабатывания (10% элемента видно)
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

     // --- Логика для страницы Генерации (если она у вас была или будет) ---
     const widthSlider = document.getElementById('imageWidth');
     const widthValueSpan = document.getElementById('widthValue');
     const heightSlider = document.getElementById('imageHeight');
     const heightValueSpan = document.getElementById('heightValue');
     // ... другие элементы формы ...

     if (widthSlider && widthValueSpan) {
         widthValueSpan.textContent = widthSlider.value; // Начальное значение
         widthSlider.oninput = function() {
             widthValueSpan.textContent = this.value;
         }
     }

     if (heightSlider && heightValueSpan) {
         heightValueSpan.textContent = heightSlider.value; // Начальное значение
         heightSlider.oninput = function() {
             heightValueSpan.textContent = this.value;
         }
     }

     // --- Логика фильтрации моделей ---
     const companyFilter = document.getElementById('companyFilter');
     const modelsContainer = document.getElementById('modelsContainer');
     const allModelCards = modelsContainer ? modelsContainer.querySelectorAll('.model-card') : [];

     if (companyFilter && modelsContainer && allModelCards.length > 0) {
         companyFilter.addEventListener('change', function() {
             const selectedCompany = this.value;

             allModelCards.forEach(card => {
                 const cardCompany = card.dataset.company; // Получаем data-company атрибут
                 // Показываем карточку, если выбрано "Все" или компания совпадает
                 if (selectedCompany === 'all' || cardCompany === selectedCompany) {
                     card.style.display = 'flex'; // Или 'block', если верстка не flex
                     // Задержка для плавного появления (если нужно)
                     setTimeout(() => card.style.opacity = 1, 50);
                 } else {
                     // Скрываем карточку
                     card.style.opacity = 0;
                      setTimeout(() => card.style.display = 'none', 300); // Скрываем после затухания
                 }
             });
         });
     }


}); // Конец DOMContentLoaded

    
    // --- Animation Trigger Logic (Для всех страниц с классом .animated) ---
    // Находим все элементы с классом .animated
    const animatedElements = document.querySelectorAll('.animated');

    // Настраиваем Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Если элемент появился в видимой области
            if (entry.isIntersecting) {
                // Добавляем классы для запуска CSS-анимаций (если они определены в CSS через keyframes)
                if (entry.target.classList.contains('fadeIn')) {
                    entry.target.classList.add('run-fadeIn'); // Добавляем класс для запуска
                }
                if (entry.target.classList.contains('slideInUp')) {
                     entry.target.classList.add('run-slideInUp'); // Добавляем класс для запуска
                }
                 // Добавьте здесь другие классы анимаций, если используете

                // Снимаем наблюдение после того, как анимация запустилась один раз (опционально)
                 // observer.unobserve(entry.target);
            }
             // Можно добавить логику для скрытия элемента, когда он уходит из виду, если нужно
             // else {
             //    entry.target.classList.remove('run-fadeIn', 'run-slideInUp');
             // }
        });
    }, {
        threshold: 0.1 // Анимация сработает, когда 10% элемента станет видно
    });

    // Начинаем наблюдение за каждым анимированным элементом
    animatedElements.forEach(el => {
         // Убедимся, что элемент изначально невидим, если используем CSS классы для запуска
         // (CSS должен установить opacity: 0 для .animated по умолчанию)
        observer.observe(el);
    });

}); // Конец обработчика DOMContentLoaded
