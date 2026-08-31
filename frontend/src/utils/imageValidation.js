import { scanImageConfig } from '../config/scanConfig'

export function validateImageFile(file) {
  if (!file || !scanImageConfig.acceptedTypes.includes(file.type)) return { valid: false, error: 'invalidType' }
  if (file.size > scanImageConfig.maxFileSizeBytes) return { valid: false, error: 'fileTooLarge' }
  return { valid: true }
}

export function checkImageDimensions(file) {
  return new Promise((resolve) => {
    const imageUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const isLargeEnough = image.width >= scanImageConfig.minDimension && image.height >= scanImageConfig.minDimension
      URL.revokeObjectURL(imageUrl)
      resolve(isLargeEnough ? { valid: true } : { valid: false, error: 'imageTooSmall' })
    }

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      resolve({ valid: false, error: 'imageUnreadable' })
    }

    image.src = imageUrl
  })
}
