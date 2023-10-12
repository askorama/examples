import { useState } from 'react'
import clx from 'classnames'
import { OramaMap } from './components/Map'

function App () {
  const [searchResults, setSearchResults] = useState()

  return (
    <>
      <div className='w-full min-h-screen grid grid-cols-[500px_1fr] bg-neutral-900 text-zinc-50'>
        <div className='bg-neutral-950 p-10'>
          <h1 className='text-2xl font-bold'> Search Airports </h1>
          <div className='text-sm text-neutral-400'>
            {
              searchResults
              ? <div> {searchResults?.count ?? 0} results in {searchResults?.elapsed?.formatted} </div>
              : <div> No results </div>
            }
          </div>
          <ul className='mt-8 text-sm h-96 overflow-scroll'>
            {searchResults?.hits?.map((hit, i) => (
              <li key={hit.id} className={clx('rounded-md mb-4 px-2 py-1', {
                'bg-neutral-900': i % 2 === 0,
                'bg-neutral-800': i % 2 === 1
              })}>
                <div className='font-bold'>
                  {hit.document.iata} - {hit.document.city}
                </div>
                <div className='text-neutral-400'>
                  {hit.document.country}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className='w-full'>
          <OramaMap onPolygonChange={setSearchResults} />
        </div>
      </div>
    </>
  )
}

export default App
