import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Додано useNavigate
import ProductCard from './ProductCard';
import './SearchPage.css';

const API_BASE_URL = 'http://localhost:5000';

function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate(); // Ініціалізація хука навігації
    const initialQuery = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        q: initialQuery,
        genre: '',
        country: '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        setFilters(prev => ({ ...prev, q: initialQuery }));
    }, [initialQuery]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_BASE_URL}/api/search?${queryParams}`);
            const data = await response.json();
            
            // Адаптація даних не потрібна, якщо ProductCard вже розуміє поле Photo
            setResults(data);
        } catch (error) {
            console.error("Помилка пошуку:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // === НОВА ФУНКЦІЯ ПЕРЕХОДУ ===
    const handleViewDetails = (item) => {
        // Визначаємо шлях залежно від типу товару
        const path = item.type === 'vinyl' ? '/vinyls' : '/cassettes';
        
        // Переходимо на сторінку каталогу і передаємо ID товару, щоб він одразу відкрився
        navigate(path, { state: { openId: item.ID } });
    };

    return (
        <div className="search-page-container">
            <aside className="filters-sidebar">
                <h3>Фільтри</h3>
                
                <div className="filter-group">
                    <label>Пошук:</label>
                    <input 
                        type="text" 
                        name="q" 
                        value={filters.q} 
                        onChange={handleFilterChange} 
                        placeholder="Назва або виконавець..."
                    />
                </div>

                <div className="filter-group">
                    <label>Жанр:</label>
                    <input 
                        type="text" 
                        name="genre" 
                        value={filters.genre} 
                        onChange={handleFilterChange} 
                        placeholder="Напр. Rock"
                    />
                </div>

                <div className="filter-group">
                    <label>Країна:</label>
                    <input 
                        type="text" 
                        name="country" 
                        value={filters.country} 
                        onChange={handleFilterChange} 
                        placeholder="Напр. UK"
                    />
                </div>

                <div className="filter-group">
                    <label>Ціна (грн):</label>
                    <div className="price-inputs">
                        <input 
                            type="number" 
                            name="minPrice" 
                            value={filters.minPrice} 
                            onChange={handleFilterChange} 
                            placeholder="Від"
                        />
                        <input 
                            type="number" 
                            name="maxPrice" 
                            value={filters.maxPrice} 
                            onChange={handleFilterChange} 
                            placeholder="До"
                        />
                    </div>
                </div>
            </aside>

            <main className="results-area">
                <h2>Результати пошуку {filters.q && `для "${filters.q}"`}</h2>
                {loading ? (
                    <p>Завантаження...</p>
                ) : results.length > 0 ? (
                    <div className="products-grid">
                        {results.map(item => (
                            <ProductCard 
                                key={`${item.type}-${item.ID}`} 
                                item={item} 
                                // Передаємо справжню функцію переходу замість console.log
                                onViewDetails={handleViewDetails} 
                            />
                        ))}
                    </div>
                ) : (
                    <p>Нічого не знайдено.</p>
                )}
            </main>
        </div>
    );
}

export default SearchPage;