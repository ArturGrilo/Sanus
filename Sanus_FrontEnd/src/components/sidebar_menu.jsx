import "../styles/sidebar_menu.css";

export default function SidebarMenu({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sanus-sidebar-overlay" onClick={onClose} />}

      <aside className={`sanus-sidebar ${isOpen ? "open" : ""}`}>
        <svg className="sanus-sidebar-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#2E5C6E" fill-opacity="1" d="M0,192L48,192C96,192,192,192,288,208C384,224,480,256,576,234.7C672,213,768,139,864,138.7C960,139,1056,213,1152,224C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>
        <nav>
          <ul>
            <li><a href="#quem-somos" onClick={onClose}>Quem Somos</a></li>
            <li><a href="#servicos" onClick={onClose}>Serviços</a></li>
            <li><a href="#blog" onClick={onClose}>Blog</a></li>
            <li><a href="#recrutamento" onClick={onClose}>Recrutamento</a></li>
            <li><a href="#contato" onClick={onClose}>Contatos</a></li>
            <a href="#agendamento" className="btn btn-secundary" onClick={onClose}>
                Agende Agora
            </a>
          </ul>
        </nav>
      </aside>
    </>
  );
}