import { create, insertMultiple } from '@orama/orama'
import data from '../data/records-formatted.json'

const db = await create({
  schema: {
    id: 'string',
    iata: 'string',
    country: 'string',
    city: 'string',
    links: 'number',
    location: 'geopoint'
  }
})

await insertMultiple(db, data)

export const orama = db
