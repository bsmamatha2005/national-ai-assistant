import { PanelLeftClose, PanelLeftOpen, Plus, MessageSquare, Sun, Moon, LogOut } from 'lucide-react'

function Sidebar({
  conversations, currentId, onSelect, onNewChat, collapsed, onToggle,
  theme, onToggleTheme, user, onLogout
}) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="icon-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        {!collapsed && (
          <button className="new-chat-btn" onClick={onNewChat}>
            <Plus size={16} />
            <span>New chat</span>
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="conversation-list">
          {conversations.map(conv => (
            <button
              key={conv.id}
              className={`conversation-item ${conv.id === currentId ? 'active' : ''}`}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare size={15} />
              <span className="conversation-title">{conv.title}</span>
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {user && (
          <button className="sidebar-footer-btn" onClick={onLogout}>
            <LogOut size={16} />
            {!collapsed && <span>Log out{user.email ? ` (${user.email})` : ''}</span>}
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar