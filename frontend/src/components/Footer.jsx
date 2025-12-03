import React from 'react'; 

export default function Footer() {
  const footerStyles = {
    backgroundColor: '#f7f5ef', // Фон як у header
    color: '#000',               // Чорний текст
    textAlign: 'center',         
    padding: '20px 0',          // Збільшимо трохи відступ
    marginTop: '30px',
    fontSize: '0.9em'            // Трохи зменшимо розмір шрифту
  };

  const linkStyles = {
    color: '#000', // Колір посилань, щоб вони були видимі
    textDecoration: 'none', // Прибираємо підкреслення
    marginLeft: '10px'
  };

  return (
    <footer style={footerStyles}>
      <p>@2025 Music Catalog</p>
      
      <div>
        <small>
          Розроблено: 
          <a 
            href="https://www.instagram.com/ваш_інстаграм" 
            target="_blank" 
            rel="noopener noreferrer"
            style={linkStyles}
          >
            Instagram
          </a> 
          
          <a 
            href="mailto:developer@example.com"
            style={linkStyles}
          >
            Email
          </a>
        </small>
      </div>
    </footer>
  );
}