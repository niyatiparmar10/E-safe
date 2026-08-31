import { AlertCircle, BadgeAlert, BadgeCheck, ExternalLink, LocateFixed, MapPinned, Navigation, Phone, SlidersHorizontal } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import { useMessages } from '../hooks/useMessages'
import { getNearbyRecyclers, getRecyclerItemTypes, requestCurrentLocation } from '../services/recyclerService'

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function RecyclerSkeleton() {
  return <div className="recycler-skeleton" aria-label="Loading recyclers"><span /><span /><span /></div>
}

function RecyclerPage() {
  const { recyclers: copy } = useMessages()
  const [searchParams] = useSearchParams()
  const itemContext = searchParams.get('item') || ''
  const [recyclers, setRecyclers] = useState(null)
  const [itemTypes, setItemTypes] = useState([])
  const [search, setSearch] = useState('')
  const [area, setArea] = useState('')
  const [itemType, setItemType] = useState('')
  const [sort, setSort] = useState('distance')
  const [error, setError] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const [directionsNote, setDirectionsNote] = useState('')

  const loadRecyclers = useCallback(async () => {
    try {
      const nearbyRecyclers = await getNearbyRecyclers({ search, area, itemType, itemContext, sort })
      setRecyclers(nearbyRecyclers)
      setError('')
    } catch {
      setError(copy.errorDescription)
    }
  }, [area, copy.errorDescription, itemContext, itemType, search, sort])

  useEffect(() => { getRecyclerItemTypes().then(setItemTypes).catch(() => setItemTypes([])) }, [])
  useEffect(() => { void Promise.resolve().then(loadRecyclers) }, [loadRecyclers])

  async function handleUseLocation() {
    setLocationMessage('')
    try {
      await requestCurrentLocation()
      setLocationMessage(copy.locationReady)
    } catch (locationError) {
      setLocationMessage(locationError?.code === 1 ? copy.locationDenied : copy.locationUnavailable)
    }
  }

  return (
    <div className="recycler-page page-stack">
      <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {itemContext && <p className="recycler-context"><MapPinned size={18} /> {copy.itemContext.replace('{item}', itemContext)}</p>}
      <section className="recycler-location">
        <div><p className="eyebrow">{copy.locationTitle}</p><p>{copy.locationDescription}</p></div>
        <button className="button button--secondary" type="button" onClick={handleUseLocation}><LocateFixed size={18} /> {copy.useLocation}</button>
        <label><span>{copy.manualAreaLabel}</span><input value={area} onChange={(event) => setArea(event.target.value)} placeholder={copy.manualAreaPlaceholder} /></label>
        {locationMessage && <p className="recycler-location__message" role="status">{locationMessage}</p>}
      </section>
      <section className="recycler-filters" aria-label="Recycler filters">
        <label><span>{copy.searchLabel}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.searchPlaceholder} /></label>
        <label><span>{copy.itemTypeLabel}</span><select value={itemType} onChange={(event) => setItemType(event.target.value)}><option value="">{copy.allItemTypes}</option>{itemTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <label><span>{copy.sortLabel}</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="distance">{copy.sortDistance}</option><option value="name">{copy.sortName}</option></select></label>
      </section>
      {directionsNote && <p className="recycler-directions-note" role="status"><Navigation size={17} /> {directionsNote}</p>}
      {error && <EmptyState icon={AlertCircle} title={copy.errorTitle} description={error}><button className="button button--secondary" type="button" onClick={loadRecyclers}>{copy.retry}</button></EmptyState>}
      {!error && recyclers === null && <><RecyclerSkeleton /><p className="history-loading-copy">{copy.loadingDescription}</p></>}
      {!error && recyclers?.length === 0 && <EmptyState icon={SlidersHorizontal} title={copy.emptyTitle} description={copy.emptyDescription} />}
      {!error && recyclers && recyclers.length > 0 && <div className="recycler-list">
        {recyclers.map((recycler) => (
          <article className="recycler-card" key={recycler.id}>
            <div className="recycler-card__heading"><div><div className="recycler-card__labels">{recycler.verified ? <span className="verification-badge verification-badge--verified"><BadgeCheck size={15} /> {copy.verified}</span> : <span className="verification-badge"><BadgeAlert size={15} /> {copy.unverified}</span>}</div><h2>{recycler.facilityName}</h2><p>{recycler.address}</p></div>{typeof recycler.distanceKm === 'number' && <strong className="distance-badge">{copy.distance.replace('{distance}', recycler.distanceKm)}</strong>}</div>
            <div className="recycler-card__details"><p><span>{copy.accepts}</span>{recycler.acceptedItemTypes.join(' · ')}</p><p><span>{copy.authorisation}</span>{recycler.authorisationReference || copy.notKnown}</p><p className="recycler-card__verified"><span>{copy.lastVerified}</span>{formatDate(recycler.lastVerifiedDate)}</p></div>
            <div className="recycler-card__actions"><a className="button button--primary" href={`tel:${recycler.contact.replace(/\s/g, '')}`}><Phone size={17} /> {copy.call}</a><button className="button button--secondary" type="button" onClick={() => setDirectionsNote(copy.directionsNote)}><Navigation size={17} /> {copy.directions}</button><a className="recycler-source" href={recycler.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> {copy.source}</a></div>
          </article>
        ))}
      </div>}
    </div>
  )
}

export default RecyclerPage
