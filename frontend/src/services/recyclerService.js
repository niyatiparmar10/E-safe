import { appConfig } from '../config/env'
import { mockRecyclers } from '../mocks/mockData'
import { mockResponse } from './mockUtils'
import { apiRequest } from './apiClient'

function normalize(value = '') {
  return value.toLowerCase().trim()
}

function matchesItemContext(recycler, itemContext) {
  const item = normalize(itemContext)
  if (!item) return true
  if (item.includes('battery')) return recycler.acceptedItemTypes.some((type) => normalize(type).includes('batter'))
  if (item.includes('computer') || item.includes('cpu')) return recycler.acceptedItemTypes.some((type) => ['computers', 'circuit boards', 'ups units'].includes(normalize(type)))
  if (item.includes('phone')) return recycler.acceptedItemTypes.some((type) => ['mobile phones', 'small electronics'].includes(normalize(type)))
  return true
}

export async function getNearbyRecyclers({ search = '', area = '', itemType = '', itemContext = '', sort = 'distance' } = {}) {
  if (appConfig.useMockApi) {
    const query = normalize(search)
    const areaQuery = normalize(area)
    const filtered = mockRecyclers
      .filter((recycler) => matchesItemContext(recycler, itemContext))
      .filter((recycler) => !itemType || recycler.acceptedItemTypes.includes(itemType))
      .filter((recycler) => !query || `${recycler.facilityName} ${recycler.address}`.toLowerCase().includes(query))
      .filter((recycler) => !areaQuery || recycler.address.toLowerCase().includes(areaQuery))
      .sort((first, second) => (sort === 'name'
        ? first.facilityName.localeCompare(second.facilityName)
        : (first.distanceKm ?? Number.POSITIVE_INFINITY) - (second.distanceKm ?? Number.POSITIVE_INFINITY)))
    return mockResponse(filtered)
  }
  const query = new URLSearchParams()
  if (search) query.set('search', search)
  if (area) query.set('area', area)
  if (itemType) query.set('itemType', itemType)
  if (itemContext) query.set('item', itemContext)
  if (sort) query.set('sort', sort)
  const response = await apiRequest(`/recyclers/nearby?${query.toString()}`)
  return response.recyclers || response
}

export async function getRecyclerItemTypes() {
  if (appConfig.useMockApi) {
    return mockResponse([...new Set(mockRecyclers.flatMap((recycler) => recycler.acceptedItemTypes))].sort())
  }
  const recyclers = await getNearbyRecyclers()
  return [...new Set(recyclers.flatMap((recycler) => recycler.acceptedItemTypes))].sort()
}

export function requestCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    )
  })
}
