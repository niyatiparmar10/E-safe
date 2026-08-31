import { AlertCircle, Database, FileText, Languages, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import Card from '../components/Card'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import RiskBadge from '../components/RiskBadge'
import { useMessages } from '../hooks/useMessages'
import { deleteAdminRecyclerRecord, getAdminRecyclerRecords, getApprovedSafetyDocuments, getStandardMessages, saveAdminRecyclerRecord, saveApprovedSafetyDocument, saveStandardMessage } from '../services/adminService'

const today = () => new Date().toISOString().slice(0, 10)

function AdminDataManagementPage() {
  const { admin } = useMessages()
  const [activeTab, setActiveTab] = useState('recyclers')
  const [data, setData] = useState({ recyclers: null, documents: null, messages: null })
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [recyclerToDelete, setRecyclerToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [recyclers, documents, messages] = await Promise.all([getAdminRecyclerRecords(), getApprovedSafetyDocuments(), getStandardMessages()])
      setData({ recyclers, documents, messages })
      setError('')
    } catch {
      setError(admin.errorDescription)
    }
  }, [admin.errorDescription])

  useEffect(() => { void Promise.resolve().then(loadData) }, [loadData])

  const tabConfig = [
    { id: 'recyclers', label: admin.tabs[0], Icon: Database },
    { id: 'documents', label: admin.tabs[1], Icon: FileText },
    { id: 'messages', label: admin.tabs[2], Icon: Languages },
  ]

  function startNewRecord() {
    if (activeTab === 'recyclers') setEditing({ kind: 'recyclers', record: { facilityName: '', address: '', contact: '', acceptedItemTypes: [], authorisationReference: '', sourceUrl: '', lastVerifiedDate: today(), verified: false } })
    if (activeTab === 'documents') setEditing({ kind: 'documents', record: { title: '', organisation: '', sourceUrl: '', publicationDate: today(), documentType: '', tags: [], active: true } })
    if (activeTab === 'messages') setEditing({ kind: 'messages', record: { language: 'en', riskLevel: 'GREEN', text: '', verified: false } })
  }

  async function saveRecord(record) {
    setIsSaving(true)
    try {
      const saved = activeTab === 'recyclers'
        ? await saveAdminRecyclerRecord(record)
        : activeTab === 'documents'
          ? await saveApprovedSafetyDocument(record)
          : await saveStandardMessage(record)
      setData((current) => {
        const records = current[activeTab] || []
        const index = records.findIndex((item) => item.id === saved.id)
        const nextRecords = index >= 0 ? records.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...records]
        return { ...current, [activeTab]: nextRecords }
      })
      setEditing(null)
    } catch {
      setError(admin.errorDescription)
    } finally {
      setIsSaving(false)
    }
  }

  async function confirmRecyclerDelete() {
    if (!recyclerToDelete) return
    setIsDeleting(true)
    try {
      await deleteAdminRecyclerRecord(recyclerToDelete.id)
      setData((current) => ({ ...current, recyclers: current.recyclers.filter((record) => record.id !== recyclerToDelete.id) }))
      setRecyclerToDelete(null)
    } catch {
      setError(admin.errorDescription)
      setRecyclerToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="admin-data page-stack">
      <PageIntro eyebrow={admin.dataEyebrow} title={admin.dataTitle} description={admin.dataDescription} />
      <div className="admin-tabs" role="tablist" aria-label={admin.dataTitle}>
        {tabConfig.map(({ id, label, Icon }) => <button className={activeTab === id ? 'is-active' : ''} role="tab" aria-selected={activeTab === id} key={id} type="button" onClick={() => { setActiveTab(id); setEditing(null) }}><Icon size={17} /> {label}</button>)}
      </div>
      {error && <EmptyState icon={AlertCircle} title={admin.errorTitle} description={error}><button className="button button--secondary" type="button" onClick={loadData}>{admin.retry}</button></EmptyState>}
      {!error && !data[activeTab] && <p className="admin-loading">{admin.loading}</p>}
      {!error && data[activeTab] && <>
        {editing?.kind === activeTab ? <AdminRecordForm activeTab={activeTab} record={editing.record} admin={admin} isSaving={isSaving} onCancel={() => setEditing(null)} onSave={saveRecord} /> : <button className="button button--primary admin-add-button" type="button" onClick={startNewRecord}><Plus size={18} /> {admin.add}</button>}
        {data[activeTab].length === 0 ? <EmptyState title={admin.noRecords} description="" /> : <AdminRecordList activeTab={activeTab} records={data[activeTab]} admin={admin} onEdit={(record) => setEditing({ kind: activeTab, record })} onDelete={setRecyclerToDelete} />}
      </>}
      {recyclerToDelete && <ConfirmDialog title={admin.deleteTitle} description={admin.deleteDescription} cancelLabel={admin.cancel} confirmLabel={isDeleting ? admin.deleting : admin.delete} isBusy={isDeleting} onCancel={() => setRecyclerToDelete(null)} onConfirm={confirmRecyclerDelete} />}
    </div>
  )
}

function AdminRecordList({ activeTab, records, admin, onEdit, onDelete }) {
  if (activeTab === 'recyclers') return <div className="admin-record-list">{records.map((record) => <Card className="admin-record" key={record.id}><div><p className="eyebrow">{record.verified ? admin.verified : admin.unverified}</p><h2>{record.facilityName}</h2><p>{record.address}</p><p><strong>{admin.recyclerFields.lastVerified}:</strong> {record.lastVerifiedDate}</p><p><strong>{admin.recyclerFields.authorisation}:</strong> {record.authorisationReference || admin.notKnown}</p><p><strong>{admin.recyclerFields.itemTypes}:</strong> {record.acceptedItemTypes.join(' · ')}</p></div><RecordActions admin={admin} onEdit={() => onEdit(record)} onDelete={() => onDelete(record)} /></Card>)}</div>
  if (activeTab === 'documents') return <div className="admin-record-list">{records.map((record) => <Card className="admin-record" key={record.id}><div><p className="eyebrow">{record.active ? admin.active : admin.inactive} · {record.documentType}</p><h2>{record.title}</h2><p>{record.organisation} · {record.publicationDate}</p><p>{record.tags.join(' · ')}</p></div><RecordActions admin={admin} onEdit={() => onEdit(record)} /></Card>)}</div>
  return <div className="admin-record-list">{records.map((record) => <Card className="admin-record" key={record.id}><div><p className="eyebrow">{record.language} · <RiskBadge level={record.riskLevel} /></p><h2>{record.id}</h2><p>{record.text}</p><p>{record.verified ? admin.verified : admin.unverified}</p></div><RecordActions admin={admin} onEdit={() => onEdit(record)} /></Card>)}</div>
}

function RecordActions({ admin, onEdit, onDelete }) {
  return <div className="admin-record__actions"><button className="button button--secondary" type="button" onClick={onEdit}><Pencil size={16} /> {admin.edit}</button>{onDelete && <button className="button button--danger" type="button" onClick={onDelete}><Trash2 size={16} /> {admin.delete}</button>}</div>
}

function AdminRecordForm({ activeTab, record, admin, isSaving, onCancel, onSave }) {
  const [values, setValues] = useState(() => ({ ...record, acceptedItemTypes: record.acceptedItemTypes?.join(', ') || '', tags: record.tags?.join(', ') || '' }))

  function update(event) {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      ...values,
      ...(activeTab === 'recyclers' ? { acceptedItemTypes: values.acceptedItemTypes.split(',').map((item) => item.trim()).filter(Boolean) } : {}),
      ...(activeTab === 'documents' ? { tags: values.tags.split(',').map((item) => item.trim()).filter(Boolean) } : {}),
    }
    onSave(payload)
  }

  const field = (name, label, type = 'text', required = false) => <label><span>{label}</span><input required={required} name={name} type={type} value={values[name] || ''} onChange={update} /></label>

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {activeTab === 'recyclers' && <><div className="admin-form__grid">{field('facilityName', admin.recyclerFields.facilityName, 'text', true)}{field('contact', admin.recyclerFields.contact, 'tel')}</div>{field('address', admin.recyclerFields.address, 'text', true)}<div className="admin-form__grid">{field('acceptedItemTypes', admin.recyclerFields.itemTypes)}{field('authorisationReference', admin.recyclerFields.authorisation)}</div><div className="admin-form__grid">{field('sourceUrl', admin.recyclerFields.sourceUrl, 'url')}{field('lastVerifiedDate', admin.recyclerFields.lastVerified, 'date')}</div><label className="admin-form__check"><input name="verified" type="checkbox" checked={Boolean(values.verified)} onChange={update} /> {admin.recyclerFields.verified}</label></>}
      {activeTab === 'documents' && <><div className="admin-form__grid">{field('title', admin.documentFields.title, 'text', true)}{field('organisation', admin.documentFields.organisation, 'text', true)}</div><div className="admin-form__grid">{field('sourceUrl', admin.documentFields.sourceUrl, 'url')}{field('publicationDate', admin.documentFields.publicationDate, 'date')}</div><div className="admin-form__grid">{field('documentType', admin.documentFields.documentType, 'text', true)}{field('tags', admin.documentFields.tags)}</div><label className="admin-form__check"><input name="active" type="checkbox" checked={Boolean(values.active)} onChange={update} /> {admin.documentFields.active}</label></>}
      {activeTab === 'messages' && <><div className="admin-form__grid">{field('language', admin.messageFields.language, 'text', true)}<label><span>{admin.messageFields.riskLevel}</span><select name="riskLevel" value={values.riskLevel || 'GREEN'} onChange={update}><option>GREEN</option><option>AMBER</option><option>RED</option><option>UNCERTAIN</option></select></label></div><label><span>{admin.messageFields.text}</span><textarea required name="text" value={values.text || ''} onChange={update} /></label><label className="admin-form__check"><input name="verified" type="checkbox" checked={Boolean(values.verified)} onChange={update} /> {admin.messageFields.verified}</label></>}
      <div className="admin-form__actions"><button className="button button--secondary" type="button" onClick={onCancel} disabled={isSaving}>{admin.cancel}</button><button className="button button--primary" type="submit" disabled={isSaving}>{isSaving ? admin.saving : admin.save}</button></div>
    </form>
  )
}

export default AdminDataManagementPage
