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