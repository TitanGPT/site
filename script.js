// Ждем, пока весь HTML-документ будет полностью загружен и разобран
document.addEventListener('DOMContentLoaded', () => {

    // --- Логика Бургер-меню (Должна быть на всех страницах) ---
    const menuToggle = document.getElementById('menuToggle');
    const mainMenu = document.getElementById('main-menu');
    const body = document.body;

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            mainMenu.classList.toggle('is-active');
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);

            if (mainMenu.classList.contains('is-active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        mainMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainMenu.classList.contains('is-active')) {
                    menuToggle.classList.remove('is-active');
                    mainMenu.classList.remove('is-active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    body.style.overflow = '';
                }
            });
        });

        document.addEventListener('click', (event) => {
            const isClickInsideMenu = mainMenu.contains(event.target);
            const isClickOnToggler = menuToggle.contains(event.target);

            if (!isClickInsideMenu && !isClickOnToggler && mainMenu.classList.contains('is-active')) {
                menuToggle.classList.remove('is-active');
                mainMenu.classList.remove('is-active');
                menuToggle.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            }
        });
    }

    // --- Логика подсветки активного пункта меню (Должна быть на всех страницах) ---
    // Убедимся, что mainMenu существует перед доступом к нему
    if (mainMenu) {
        const currentPath = window.location.pathname.split("/").pop() || 'index.html';
        const navLinks = mainMenu.querySelectorAll('a');

        navLinks.forEach(link => {
            // Сначала получаем href, чтобы избежать ошибки, если его нет
            const href = link.getAttribute('href');
            if (href) {
                const linkPath = href.split("/").pop();
                link.classList.remove('active'); // Убираем у всех
                if (linkPath === currentPath) {
                    link.classList.add('active'); // Добавляем только нужному
                }
            }
        });
    }


    // --- Image Generation Page Logic (Только для generate.html) ---
    const generationForm = document.getElementById('generationForm');
    // Проверяем наличие формы на странице, чтобы остальной код не вызывал ошибок на других страницах
    if (generationForm) {
        const promptInput = document.getElementById('promptInput');
        const enhanceCheckbox = document.getElementById('enhanceCheckbox');
        const seedInput = document.getElementById('seedInput');
        const widthSlider = document.getElementById('widthSlider'); // Используем ОДНО имя переменной
        const widthValueDisplay = document.getElementById('widthValueDisplay'); // Используем ОДНО имя переменной
        const heightSlider = document.getElementById('heightSlider'); // Используем ОДНО имя переменной
        const heightValueDisplay = document.getElementById('heightValueDisplay'); // Используем ОДНО имя переменной
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
            widthSlider.addEventListener('input', () => { // Используем addEventListener
                widthValueDisplay.textContent = widthSlider.value;
            });
        }
        if (heightSlider && heightValueDisplay) {
            heightValueDisplay.textContent = heightSlider.value; // Начальное значение
            heightSlider.addEventListener('input', () => { // Используем addEventListener
                heightValueDisplay.textContent = heightSlider.value;
            });
        }

        // Обрабатываем отправку формы генерации
        generationForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Отменяем стандартное поведение браузера

            // Проверка наличия необходимых элементов перед обращением к ним
            if (!resultSection || !imageResult || !errorDisplay || !downloadLink || !loadingIndicator || !generateButton || !promptInput || !enhanceCheckbox || !seedInput || !generatedImage) {
                console.error("Ошибка: Не все элементы формы генерации найдены на странице.");
                return; // Прерываем выполнение, если чего-то не хватает
            }

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
            const width = widthSlider ? parseInt(widthSlider.value, 10) : 1024; // Значение по умолчанию, если слайдера нет
            const height = heightSlider ? parseInt(heightSlider.value, 10) : 1024; // Значение по умолчанию

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

                const result = await response.json();

                if (result.imageUrl) {
                    generatedImage.src = result.imageUrl;
                    downloadLink.href = result.imageUrl;
                    imageResult.style.display = 'block';
                    downloadLink.style.display = 'inline-block'; // Или 'block', зависит от CSS
                    errorDisplay.style.display = 'none';
                } else {
                     throw new Error('Некорректный ответ от сервера: отсутствует imageUrl.');
                }

            } catch (error) {
                console.error('Ошибка при генерации изображения:', error);
                errorDisplay.textContent = `Произошла ошибка: ${error.message}`;
                errorDisplay.style.display = 'block';
                imageResult.style.display = 'none';
                downloadLink.style.display = 'none'; // Скрываем ссылку при ошибке
            } finally {
                // --- Обновления UI: Конец загрузки ---
                loadingIndicator.style.display = 'none';
                generateButton.disabled = false;
                generateButton.textContent = 'Сгенерировать';
            }
        });
    } // Конец if (generationForm)


    // --- Model Page Filter Logic (Только для models.html) ---
    const companyFilter = document.getElementById('companyFilter');
    const modelsContainer = document.getElementById('modelsContainer');

    // Проверяем, что элементы фильтра существуют на текущей странице
    if (companyFilter && modelsContainer) {
        const allModelCards = modelsContainer.querySelectorAll('.model-card'); // Получаем все карточки моделей

        const filterModels = () => {
            const selectedCompany = companyFilter.value;

            allModelCards.forEach(card => {
                const cardCompany = card.dataset.company; // Используем dataset для data- атрибутов

                // Плавное скрытие/показ
                const shouldShow = selectedCompany === 'all' || cardCompany === selectedCompany;
                const isCurrentlyHidden = card.style.display === 'none';

                if (shouldShow) {
                    // Показываем
                    card.style.opacity = '0'; // Сначала невидимый для анимации
                     // Устанавливаем display flex ДО изменения opacity
                    card.style.display = 'flex';
                    // Небольшая задержка перед установкой opacity = 1 для срабатывания transition
                    setTimeout(() => {
                         card.style.opacity = '1';
                    }, 10); // Маленькая задержка
                } else if (!isCurrentlyHidden) {
                    // Скрываем, только если не скрыт уже
                    card.style.opacity = '0';
                    // Скрываем display ПОСЛЕ завершения анимации opacity (transition duration)
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300); // Должно совпадать с transition-duration в CSS для opacity
                }
            });
        };

        // Применяем фильтр при изменении значения в выпадающем списке
        companyFilter.addEventListener('change', filterModels);

        // Опционально: Применить фильтр при загрузке страницы, если нужно
        // filterModels();
    } // Конец if (companyFilter && modelsContainer)


    // --- Animation Trigger Logic (Для всех страниц с классом .animated) ---
    const animatedElements = document.querySelectorAll('.animated');

    if (animatedElements.length > 0) { // Проверяем, есть ли вообще анимируемые элементы
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let animationClass = '';
                    // Определяем класс для ЗАПУСКА анимации
                    if (entry.target.classList.contains('fadeIn')) {
                        animationClass = 'run-fadeIn';
                    } else if (entry.target.classList.contains('slideInUp')) {
                        animationClass = 'run-slideInUp';
                    } // Добавьте другие типы здесь, если нужно

                    // Добавляем класс ЗАПУСКА анимации, если он определен
                    if (animationClass) {
                        entry.target.classList.add(animationClass);
                    }

                    // Перестаем наблюдать за элементом после первого срабатывания
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Срабатывает, когда 10% элемента видно
        });

        // Начинаем наблюдение за каждым элементом
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } // Конец if (animatedElements.length > 0)

}); // --- КОНЕЦ ГЛАВНОГО DOMContentLoaded ---
