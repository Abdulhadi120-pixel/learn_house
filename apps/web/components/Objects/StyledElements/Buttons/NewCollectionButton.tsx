'use client'
import { useTranslation } from 'react-i18next'

function NewCollectionButton() {
  const { t } = useTranslation()
  return (
    <button className="rounded-lg transition-all duration-150 ease-linear antialiased ring-offset-purple-800 p-2 px-5 my-auto font text-xs font-bold drop-shadow-lg flex space-x-2 items-center bg-[#059669] text-white hover:bg-white hover:text-black">
      <div>{t('collections.new_collection')} </div>
      <div className="text-md bg-white/10 px-1 rounded-full">+</div>
    </button>
  )
}

export default NewCollectionButton
