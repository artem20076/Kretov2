const API_BASE_URL = 'http://localhost:8082/component';

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация элементов
    const homePage = document.getElementById('homePage');
    const phonePage = document.getElementById('phonePage');
    const adminPage = document.getElementById('adminPage');
    const homeLink = document.getElementById('homeLink');
    const adminLink = document.getElementById('adminLink');
    const backButton = document.getElementById('backButton');
    const phonesGrid = document.getElementById('phonesGrid');
    const phoneDetail = document.getElementById('phoneDetail');
    const addPhoneForm = document.getElementById('addPhoneForm');
    const refreshPhonesBtn = document.getElementById('refreshPhones');
    const adminPhonesList = document.getElementById('adminPhonesList');
    const phoneSearch = document.getElementById('phoneSearch');
    const categoryTags = document.querySelectorAll('.category-tag');

    // Навигация
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('homePage');
        loadPhones();
    });
    
    adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('adminPage');
        loadAdminPhones();
    });
    
    backButton.addEventListener('click', () => showPage('homePage'));

    // Загрузка данных
    refreshPhonesBtn?.addEventListener('click', loadAdminPhones);
    addPhoneForm?.addEventListener('submit', handleAddPhone);
    phoneSearch?.addEventListener('input', (e) => searchPhones(e.target.value));

    // Обработка категорий
    categoryTags.forEach(tag => {
        tag.addEventListener('click', () => {
            categoryTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            filterPhonesByCategory(tag.textContent.trim());
        });
    });

    // Инициализация
    showPage('homePage');
    loadPhones();
});

// Функции
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

async function loadPhones() {
    try {
        const response = await fetch(API_BASE_URL);
        const components = await response.json();
        displayPhones(components);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Не удалось загрузить каталог телефонов');
    }
}

async function searchPhones(query) {
    if (!query || query.length < 2) {
        loadPhones();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        const components = await response.json();
        displayPhones(components);
    } catch (error) {
        console.error('Ошибка поиска:', error);
    }
}

function filterPhonesByCategory(category) {
    if (category === 'Все') {
        loadPhones();
        return;
    }
    
    const typeMap = {
        'iPhone': 'IPHONE',
        'Android': 'ANDROID',
        'Другие': 'OTHER'
    };
    
    const type = typeMap[category];
    if (!type) return;
    
    const phonesGrid = document.getElementById('phonesGrid');
    const phoneCards = phonesGrid.querySelectorAll('.phone-card');
    
    phoneCards.forEach(card => {
        const phoneType = card.getAttribute('data-type');
        if (phoneType === type) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function displayPhones(components) {
    const grid = document.getElementById('phonesGrid');
    grid.innerHTML = '';
    
    if (!components?.length) {
        grid.innerHTML = '<p>Телефоны не найдены</p>';
        return;
    }
    
    components.forEach(component => {
        const phoneData = parseComponentData(component);
        
        const card = document.createElement('div');
        card.className = 'phone-card';
        card.setAttribute('data-type', component.type);
        card.innerHTML = `
            <div class="phone-image" style="background-image: url('${component.imageUrl || 'default-phone.png'}')"></div>
            <div class="phone-info">
                <h3>${phoneData.brand} ${phoneData.model}</h3>
                <span class="phone-type">${getTypeName(component.type)}</span>
                <p class="phone-price">${phoneData.price}</p>
            </div>
        `;
        card.addEventListener('click', () => showPhoneDetail(component.id));
        grid.appendChild(card);
    });
}

function parseComponentData(component) {
    // Разделяем name на бренд и модель
    const [brand = '', ...modelParts] = component.name.split(' ');
    const model = modelParts.join(' ');
    
    // Извлекаем цену из specs
    const priceMatch = component.specs?.match(/Цена:\s*(\d+)/);
    const price = priceMatch ? `${priceMatch[1]}₽` : '—';
    
    return { brand, model, price };
}

function getTypeName(type) {
    const types = {
        'IPHONE': 'iPhone',
        'ANDROID': 'Android',
        'OTHER': 'Другой'
    };
    return types[type] || type;
}

async function showPhoneDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const component = await response.json();
        
        if (!component) throw new Error('Телефон не найден');
        renderPhoneDetail(component);
        showPage('phonePage');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить информацию о телефоне');
    }
}

function renderPhoneDetail(component) {
    const detail = document.getElementById('phoneDetail');
    const phoneData = parseComponentData(component);
    
    detail.innerHTML = `
        <div class="detail-header">
            <div class="detail-image" style="background-image: url('${component.imageUrl || 'default-phone.png'}')"></div>
            <div class="detail-title">
                <h2>${phoneData.brand} ${phoneData.model}</h2>
                <div class="detail-meta">
                    <span class="phone-type">${getTypeName(component.type)}</span>
                </div>
                <div class="detail-price">${phoneData.price}</div>
                
                <h3>Описание:</h3>
                <p>${component.description || 'Нет описания'}</p>
                
                <h3>Характеристики:</h3>
                <ul class="phone-specs">
                    ${component.specs?.split('\n').map(spec => spec.trim() ? `<li>${spec}</li>` : '').join('') || '<li>Нет характеристик</li>'}
                </ul>
            </div>
        </div>
    `;
}

async function loadAdminPhones() {
    try {
        const response = await fetch(API_BASE_URL);
        const components = await response.json();
        displayAdminPhones(components);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить каталог');
    }
}

function displayAdminPhones(components) {
    const list = document.getElementById('adminPhonesList');
    list.innerHTML = '';
    
    if (!components?.length) {
        list.innerHTML = '<p>Нет телефонов в каталоге</p>';
        return;
    }
    
    components.forEach(component => {
        const phoneData = parseComponentData(component);
        
        const item = document.createElement('div');
        item.className = 'admin-phone-item';
        item.innerHTML = `
            <div>
                <h4>${phoneData.brand} ${phoneData.model}</h4>
                <small>${getTypeName(component.type)} • ${phoneData.price}</small>
            </div>
            <div class="admin-phone-actions">
                <button class="edit-btn" data-id="${component.id}">Изменить</button>
                <button class="delete-btn" data-id="${component.id}">Удалить</button>
            </div>
        `;
        list.appendChild(item);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deletePhone(e.target.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editPhone(e.target.getAttribute('data-id'));
        });
    });
}

async function handleAddPhone(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: `${form.phoneBrand.value} ${form.phoneModel.value}`.trim(),
        type: form.phoneType.value,
        description: form.phoneDesc.value,
        specs: `Цена: ${form.phonePrice.value}₽\n${form.phoneSpecs.value}`.trim(),
        imageUrl: form.phoneImage.value || "default-phone.png"
    };
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Ошибка сервера');
        
        await response.json();
        alert(`Телефон "${form.phoneBrand.value} ${form.phoneModel.value}" добавлен в каталог!`);
        form.reset();
        loadAdminPhones();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при добавлении: ' + error.message);
    }
}

async function deletePhone(id) {
    if (!confirm('Вы уверены, что хотите удалить этот телефон?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Ошибка при удалении');
        
        alert('Телефон успешно удален');
        loadAdminPhones();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при удалении: ' + error.message);
    }
}

async function editPhone(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const component = await response.json();
        
        if (!component) throw new Error('Телефон не найден');
        
        const phoneData = parseComponentData(component);
        const priceMatch = component.specs?.match(/Цена:\s*(\d+)/);
        const specs = component.specs?.replace(/Цена:\s*\d+₽?\n?/, '').trim();
        
        const form = document.getElementById('addPhoneForm');
        
        // Заполняем форму редактирования
        form.phoneBrand.value = phoneData.brand;
        form.phoneModel.value = phoneData.model;
        form.phoneType.value = component.type;
        form.phonePrice.value = priceMatch?.[1] || '';
        form.phoneDesc.value = component.description || '';
        form.phoneSpecs.value = specs || '';
        form.phoneImage.value = component.imageUrl || '';
        
        // Прокручиваем к форме
        form.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при загрузке данных телефона: ' + error.message);
    }
}