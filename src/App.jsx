import { useEffect, useMemo, useRef, useState } from 'react'
import {
  categories,
  demoTickets,
  formatAge,
  priorityOptions,
  statusOptions,
  triageTicket,
} from './data/demoTickets'
import { createTicket, getTickets, updateTicket } from './services/tickets'
import './App.css'

const iconPaths = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  inbox: 'M4 4h16l2 10v5H2v-5L4 4zm-2 10h6l2 3h4l2-3h6',
  chart: 'M3 3v18h18M7 14l4-4 4 3 6-7',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-11a4 4 0 0 1 0 8m-9-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  search: 'm21 21-4.35-4.35M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z',
  plus: 'M12 5v14m-7-7h14',
  chevron: 'm9 18 6-6-6-6',
  clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  check: 'm5 12 4 4L19 6',
  spark:
    'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z',
  close: 'M18 6 6 18M6 6l12 12',
}
const dashboardDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})
  .format(new Date())
  .toUpperCase()

function Icon({ name, size = 18 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}

function Badge({ kind, children }) {
  return (
    <span className={`badge badge-${kind.toLowerCase().replaceAll(' ', '-')}`}>{children}</span>
  )
}

function TicketDialog({ onClose, onCreate }) {
  const dialogRef = useRef(null)
  const customerInputRef = useRef(null)
  const [form, setForm] = useState({
    customer: '',
    email: '',
    subject: '',
    description: '',
    category: '',
    channel: 'Phone',
  })
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    customerInputRef.current?.focus()
  }, [])

  const setField = (event) => {
    const next = { ...form, [event.target.name]: event.target.value }
    setForm(next)
    if (event.target.name === 'subject' || event.target.name === 'description')
      setSuggestion(triageTicket(next))
  }

  async function submit(event) {
    event.preventDefault()
    if (
      !form.customer.trim() ||
      !form.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ||
      !form.subject.trim() ||
      !form.description.trim()
    ) {
      setError(
        !form.customer.trim() ||
          !form.email.trim() ||
          !form.subject.trim() ||
          !form.description.trim()
          ? 'Complete each required field before creating the ticket.'
          : 'Enter a valid email address before creating the ticket.'
      )
      return
    }
    await onCreate({
      ...form,
      category: suggestion?.category || form.category || 'Other',
      priority: suggestion?.priority || 'Normal',
    })
  }

  return (
    <dialog
      ref={dialogRef}
      className="ticket-dialog"
      aria-labelledby="new-ticket-title"
      onCancel={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">CUSTOMER SUPPORT</span>
            <h2 id="new-ticket-title">Create a ticket</h2>
            <p>Capture the issue and let smart triage route it.</p>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close create ticket dialog"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="row g-3">
          <div className="col-sm-6">
            <label className="form-label" htmlFor="customer">
              Customer name <span aria-hidden="true">*</span>
            </label>
            <input
              ref={customerInputRef}
              className="form-control"
              id="customer"
              name="customer"
              value={form.customer}
              onChange={setField}
              required
            />
          </div>
          <div className="col-sm-6">
            <label className="form-label" htmlFor="email">
              Email address <span aria-hidden="true">*</span>
            </label>
            <input
              className="form-control"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={setField}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="subject">
              Issue summary <span aria-hidden="true">*</span>
            </label>
            <input
              className="form-control"
              id="subject"
              name="subject"
              value={form.subject}
              onChange={setField}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="description">
              What happened? <span aria-hidden="true">*</span>
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="3"
              value={form.description}
              onChange={setField}
              required
            />
          </div>
          <div className="col-sm-6">
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <select
              className="form-select"
              id="category"
              name="category"
              value={form.category || suggestion?.category || ''}
              onChange={setField}
            >
              <option value="">Smart triage suggestion</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="col-sm-6">
            <label className="form-label" htmlFor="channel">
              Contact channel
            </label>
            <select
              className="form-select"
              id="channel"
              name="channel"
              value={form.channel}
              onChange={setField}
            >
              <option>Phone</option>
              <option>Email</option>
              <option>Chat</option>
              <option>Social</option>
            </select>
          </div>
        </div>
        {suggestion && (
          <div className="triage-preview mt-3">
            <Icon name="spark" size={16} />
            <span>Suggested triage</span>
            <Badge kind={suggestion.priority}>{suggestion.priority} priority</Badge>
            <span className="triage-category">{form.category || suggestion.category}</span>
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create ticket
          </button>
        </div>
      </form>
    </dialog>
  )
}

function App() {
  const [tickets, setTickets] = useState(demoTickets)
  const [source, setSource] = useState('loading')
  const [activeFilter, setActiveFilter] = useState('All tickets')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [showDialog, setShowDialog] = useState(false)
  const [notice, setNotice] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const createTicketButtonRef = useRef(null)
  const dialogWasOpen = useRef(false)

  useEffect(() => {
    getTickets().then(({ tickets: result, source: origin }) => {
      setTickets(result)
      setSource(origin)
    })
  }, [])
  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    if (showDialog) {
      dialogWasOpen.current = true
      return
    }
    if (dialogWasOpen.current) {
      createTicketButtonRef.current?.focus()
      dialogWasOpen.current = false
    }
  }, [showDialog])

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((ticket) => ticket.status === 'Open').length,
      urgent: tickets.filter(
        (ticket) => ticket.priority === 'Urgent' && ticket.status !== 'Resolved'
      ).length,
      resolved: tickets.filter((ticket) => ticket.status === 'Resolved').length,
    }),
    [tickets]
  )
  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const matchesFilter =
          activeFilter === 'All tickets' ||
          (activeFilter === 'My tickets'
            ? ticket.assignee === 'Maya Chen'
            : activeFilter === 'Unassigned'
              ? ticket.assignee === 'Unassigned'
              : ticket.status === activeFilter)
        const query = search.trim().toLowerCase()
        const matchesSearch =
          !query ||
          `${ticket.ticketNumber} ${ticket.subject} ${ticket.customer} ${ticket.email}`
            .toLowerCase()
            .includes(query)
        return (
          matchesFilter &&
          matchesSearch &&
          (priorityFilter === 'All priorities' || ticket.priority === priorityFilter)
        )
      }),
    [tickets, activeFilter, search, priorityFilter]
  )

  async function handleCreate(input) {
    const result = await createTicket(input)
    setTickets((current) => [result.data, ...current])
    setSource(result.source || source)
    setShowDialog(false)
    setNotice(`Ticket ${result.data.ticketNumber} created and triaged as ${result.data.priority}.`)
  }

  async function changeStatus(ticket, status) {
    const next = { ...ticket, status, updatedAt: new Date().toISOString() }
    setTickets((current) => current.map((item) => (item._id === ticket._id ? next : item)))
    setSelectedTicket(next)
    try {
      await updateTicket(ticket._id, { status })
    } catch {
      setNotice('Ticket updated in this demo session; MongoDB could not be reached.')
    }
    if (status === 'Resolved') setNotice(`${ticket.ticketNumber} marked as resolved.`)
  }

  const filterItems = [
    { label: 'All tickets', icon: 'inbox', count: counts.all },
    { label: 'Open', icon: 'clock', count: counts.open },
    { label: 'In progress', icon: 'chart' },
    { label: 'Pending', icon: 'clock' },
    { label: 'Resolved', icon: 'check', count: counts.resolved },
    { label: 'My tickets', icon: 'users' },
    { label: 'Unassigned', icon: 'users' },
  ]

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar" aria-label="Main navigation">
        <a className="brand" href="#main-content" aria-label="PulseDesk home">
          <span className="brand-mark">p</span>
          <span>
            pulse<span className="brand-light">desk</span>
          </span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switch">
          <span className="visually-hidden">Northstar Support workspace</span>
          <span className="workspace-avatar" aria-hidden="true">
            N
          </span>
          <span className="workspace-name">
            Northstar Support<small>Business plan</small>
          </span>
          <span className="switch-chevron">⌄</span>
        </div>
        <nav className="primary-nav" aria-label="Workspace">
          <a href="#main-content" className="nav-link active" aria-current="page">
            <Icon name="grid" /> Overview
          </a>
          <a href="#ticket-queue" className="nav-link">
            <Icon name="inbox" /> Inbox<span className="nav-count">{counts.open}</span>
          </a>
          <a href="#insights" className="nav-link">
            <Icon name="chart" /> Insights
          </a>
          <a href="#team" className="nav-link">
            <Icon name="users" /> Team
          </a>
        </nav>
        <div className="sidebar-section">
          <span>YOUR QUEUES</span>
        </div>
        <nav aria-label="Ticket queues" className="queue-nav">
          {filterItems.map((item) => (
            <button
              type="button"
              key={item.label}
              aria-label={item.label}
              className={`nav-link queue-link ${activeFilter === item.label ? 'active' : ''}`}
              aria-pressed={activeFilter === item.label}
              onClick={() => {
                setActiveFilter(item.label)
                document.getElementById('ticket-queue')?.scrollIntoView({
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'auto'
                    : 'smooth',
                  block: 'start',
                })
              }}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              {item.count !== undefined && <span className="queue-count">{item.count}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className={`db-status ${source === 'mongo' ? 'connected' : ''}`}>
            <span className="status-dot" />
            <span>
              {source === 'mongo'
                ? 'MongoDB connected'
                : source === 'loading'
                  ? 'Connecting to workspace…'
                  : 'Demo mode'}
              <small>{source === 'mongo' ? 'Data synced locally' : 'Connect local database'}</small>
            </span>
          </div>
          <div className="profile-card">
            <span className="profile-avatar" aria-hidden="true">
              MC
            </span>
            <span className="visually-hidden">Signed in as Maya Chen</span>
            <span className="profile-name">
              Maya Chen<small>Support agent</small>
            </span>
            <span className="switch-chevron">···</span>
          </div>
        </div>
      </aside>
      <main id="main-content" className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <Icon name="chevron" size={14} />
            <strong>Overview</strong>
          </div>
          <div className="topbar-actions">
            <span className="live-indicator">
              <span className="status-dot" /> Live
            </span>
            <span className="topbar-avatar" role="img" aria-label="Maya Chen">
              MC
            </span>
          </div>
        </header>
        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                {dashboardDate} <span className="heading-separator">/</span> TEAM OVERVIEW
              </div>
              <h1>
                Good morning, Maya <span aria-hidden="true">✳</span>
              </h1>
              <p>Here’s what’s happening with your support queue today.</p>
            </div>
            <button
              ref={createTicketButtonRef}
              className="btn btn-primary new-ticket-button"
              type="button"
              onClick={() => setShowDialog(true)}
            >
              <Icon name="plus" size={17} /> New ticket
            </button>
          </section>
          <section className="metrics row g-3" aria-label="Support metrics">
            <div className="col-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span>Open tickets</span>
                  <span className="metric-icon blue">
                    <Icon name="inbox" size={17} />
                  </span>
                </div>
                <div className="metric-value">
                  {counts.open}
                  <span className="metric-trend positive">↓ 12%</span>
                </div>
                <p>vs. last 7 days</p>
                <div className="mini-chart blue-chart" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            </div>
            <div className="col-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span>Urgent priority</span>
                  <span className="metric-icon coral">
                    <Icon name="clock" size={17} />
                  </span>
                </div>
                <div className="metric-value">
                  {counts.urgent}
                  <span className="metric-trend negative">↑ 2</span>
                </div>
                <p>Need attention now</p>
                <div className="mini-chart coral-chart" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            </div>
            <div className="col-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span>Avg. first response</span>
                  <span className="metric-icon violet">
                    <Icon name="chart" size={17} />
                  </span>
                </div>
                <div className="metric-value">
                  4<span className="metric-unit">m</span> 32<span className="metric-unit">s</span>
                  <span className="metric-trend positive">↓ 8%</span>
                </div>
                <p>Target under 5 minutes</p>
                <div
                  className="progress-track"
                  role="img"
                  aria-label="92 percent of response time target"
                >
                  <span style={{ width: '92%' }} />
                </div>
              </article>
            </div>
            <div className="col-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span>Resolved today</span>
                  <span className="metric-icon green">
                    <Icon name="check" size={17} />
                  </span>
                </div>
                <div className="metric-value">
                  {counts.resolved + 18}
                  <span className="metric-trend positive">↑ 18%</span>
                </div>
                <p>Across 4 agents</p>
                <div
                  className="avatar-stack"
                  aria-label="Agents: Maya Chen, Jordan Lee, Sam Rivera, Alex Kim"
                >
                  <span>MC</span>
                  <span>JL</span>
                  <span>SR</span>
                  <span>AK</span>
                  <small>+2</small>
                </div>
              </article>
            </div>
          </section>
          <section className="queue-panel" id="ticket-queue" aria-labelledby="queue-title">
            <div className="queue-heading">
              <div>
                <div className="queue-title-line">
                  <h2 id="queue-title">Ticket queue</h2>
                  <span className="queue-total">{filteredTickets.length}</span>
                </div>
                <p>Review, prioritize, and resolve customer conversations.</p>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setActiveFilter('All tickets')
                  setPriorityFilter('All priorities')
                  setSearch('')
                }}
              >
                View all <Icon name="chevron" size={15} />
              </button>
            </div>
            <div className="queue-toolbar">
              <div className="filter-tabs" role="group" aria-label="Filter tickets by status">
                {['All tickets', 'Open', 'In progress', 'Pending', 'Resolved'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={activeFilter === filter ? 'selected' : ''}
                    aria-pressed={activeFilter === filter}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="toolbar-controls">
                <label className="search-field">
                  <Icon name="search" size={16} />
                  <span className="visually-hidden">Search tickets</span>
                  <input
                    type="search"
                    placeholder="Search tickets…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <label className="visually-hidden" htmlFor="priority-filter">
                  Filter by priority
                </label>
                <select
                  id="priority-filter"
                  className="form-select priority-select"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  <option>All priorities</option>
                  {priorityOptions.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
                <button
                  className="filter-button"
                  type="button"
                  onClick={() => {
                    setPriorityFilter(
                      priorityFilter === 'All priorities' ? 'High' : 'All priorities'
                    )
                  }}
                  aria-pressed={priorityFilter === 'High'}
                >
                  <span className="filter-lines">≡</span>
                  <span className="visually-hidden">Toggle high-priority filter</span>
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table ticket-table mb-0">
                <caption className="visually-hidden">
                  Customer support ticket queue with priority, customer, status, assignee, and age
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Ticket</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Status</th>
                    <th scope="col">Assignee</th>
                    <th scope="col">Created</th>
                    <th scope="col">
                      <span className="visually-hidden">Open ticket</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={selectedTicket?._id === ticket._id ? 'row-selected' : ''}
                    >
                      <td>
                        <button
                          className="ticket-subject"
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <span className="ticket-number">{ticket.ticketNumber}</span>
                          <span>{ticket.subject}</span>
                        </button>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span
                            className={`customer-avatar avatar-${ticket.customer.charCodeAt(0) % 5}`}
                          >
                            {ticket.customer
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </span>
                          <span>{ticket.customer}</span>
                        </div>
                      </td>
                      <td>
                        <Badge kind={ticket.priority}>
                          <span className="priority-dot" />
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td>
                        <Badge kind={ticket.status}>
                          <span className="status-dot" />
                          {ticket.status}
                        </Badge>
                      </td>
                      <td>
                        <span className="assignee-cell">
                          <span className="assignee-avatar">
                            {ticket.assignee === 'Unassigned'
                              ? '+'
                              : ticket.assignee
                                  .split(' ')
                                  .map((part) => part[0])
                                  .join('')}
                          </span>
                          {ticket.assignee}
                        </span>
                      </td>
                      <td className="time-cell">{formatAge(ticket.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="row-open"
                          aria-label={`Open ${ticket.ticketNumber}`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Icon name="chevron" size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTickets.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">
                    <Icon name="inbox" size={24} />
                  </span>
                  <h3>No tickets match this view</h3>
                  <p>Try a different queue, priority, or search term.</p>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      setActiveFilter('All tickets')
                      setPriorityFilter('All priorities')
                      setSearch('')
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            <div className="queue-footer">
              <span>
                Showing{' '}
                <strong>
                  {filteredTickets.length ? 1 : 0}–{filteredTickets.length}
                </strong>{' '}
                of <strong>{filteredTickets.length}</strong> tickets
              </span>
              <div className="pagination-controls">
                <button type="button" disabled aria-label="Previous page">
                  ‹
                </button>
                <button type="button" className="current-page" aria-current="page">
                  1
                </button>
                <button type="button" disabled aria-label="Next page">
                  ›
                </button>
              </div>
            </div>
          </section>
          <section className="bottom-grid" id="insights" aria-label="Queue insights">
            <article className="insight-card" id="team">
              <div className="insight-heading">
                <div>
                  <h2>Team workload</h2>
                  <p>Active tickets by agent</p>
                </div>
              </div>
              <div className="workload-list">
                <div>
                  <span className="workload-avatar blue-avatar">MC</span>
                  <span className="workload-name">
                    Maya Chen<small>Support specialist</small>
                  </span>
                  <span className="workload-number">8</span>
                  <div className="workload-progress">
                    <span style={{ width: '64%' }} />
                  </div>
                </div>
                <div>
                  <span className="workload-avatar peach-avatar">JL</span>
                  <span className="workload-name">
                    Jordan Lee<small>Support specialist</small>
                  </span>
                  <span className="workload-number">6</span>
                  <div className="workload-progress">
                    <span style={{ width: '48%' }} />
                  </div>
                </div>
                <div>
                  <span className="workload-avatar lilac-avatar">SR</span>
                  <span className="workload-name">
                    Sam Rivera<small>Billing specialist</small>
                  </span>
                  <span className="workload-number">5</span>
                  <div className="workload-progress">
                    <span style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </article>
            <article className="insight-card sla-card">
              <div className="insight-heading">
                <div>
                  <h2>SLA health</h2>
                  <p>First-response targets today</p>
                </div>
                <span className="sla-pill">
                  <span className="status-dot" /> On track
                </span>
              </div>
              <div className="sla-summary">
                <div className="sla-score">
                  94<span>%</span>
                </div>
                <div>
                  <strong>Response rate</strong>
                  <small>Within the 5-minute target</small>
                </div>
                <div className="sla-trend">
                  ↑ 3.2%<small>this week</small>
                </div>
              </div>
              <div
                className="sla-bar"
                role="img"
                aria-label="94 percent of tickets met the response SLA"
              >
                <span />
              </div>
              <div className="sla-foot">
                <span>0–5 min</span>
                <span>Target: 90%</span>
              </div>
            </article>
          </section>
          <footer className="page-footer">
            <span>
              PulseDesk <span aria-hidden="true">·</span> Support operations
            </span>
            <span>
              Local-first demo{' '}
              <span className={`footer-dot ${source === 'mongo' ? 'is-connected' : ''}`} />{' '}
              {source === 'mongo' ? 'MongoDB connected' : 'Sample data active'}
            </span>
          </footer>
        </div>
      </main>
      {selectedTicket && (
        <aside className="ticket-detail" aria-labelledby="detail-title">
          <div className="detail-head">
            <div>
              <span className="ticket-number">{selectedTicket.ticketNumber}</span>
              <h2 id="detail-title">Ticket details</h2>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Close ticket details"
              onClick={() => setSelectedTicket(null)}
            >
              <Icon name="close" />
            </button>
          </div>
          <h3>{selectedTicket.subject}</h3>
          <div className="detail-badges">
            <Badge kind={selectedTicket.priority}>{selectedTicket.priority}</Badge>
            <Badge kind={selectedTicket.status}>
              <span className="status-dot" />
              {selectedTicket.status}
            </Badge>
          </div>
          <div className="detail-section">
            <span className="detail-label">CUSTOMER</span>
            <div className="detail-customer">
              <span className="customer-avatar avatar-2">
                {selectedTicket.customer
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </span>
              <div>
                <strong>{selectedTicket.customer}</strong>
                <a href={`mailto:${selectedTicket.email}`}>{selectedTicket.email}</a>
              </div>
            </div>
          </div>
          <div className="detail-section">
            <span className="detail-label">DESCRIPTION</span>
            <p>{selectedTicket.description}</p>
          </div>
          <div className="detail-section detail-meta">
            <div>
              <span className="detail-label">CATEGORY</span>
              <strong>{selectedTicket.category}</strong>
            </div>
            <div>
              <span className="detail-label">CHANNEL</span>
              <strong>{selectedTicket.channel}</strong>
            </div>
            <div>
              <span className="detail-label">ASSIGNEE</span>
              <strong>{selectedTicket.assignee}</strong>
            </div>
          </div>
          <div className="detail-section">
            <label className="detail-label" htmlFor="ticket-status">
              UPDATE STATUS
            </label>
            <select
              id="ticket-status"
              className="form-select"
              value={selectedTicket.status}
              onChange={(event) => changeStatus(selectedTicket, event.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </aside>
      )}
      {showDialog && <TicketDialog onClose={() => setShowDialog(false)} onCreate={handleCreate} />}
      {notice && (
        <div className="toast-message" role="status">
          <Icon name="check" size={18} />
          {notice}
          <button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

export default App
