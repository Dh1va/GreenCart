import React from 'react'
import MainBanner from '../components/MainBanner'
// import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import ShopByCategory from '../components/ShopByCategory'

const Home = () => {
  return (
    <div className='mt-10'>
        <MainBanner/>
        {/* <Categories/> */}
        <ShopByCategory/>
        <BestSeller/>
        {/* <BottomBanner/>
        <NewsLetter/> */}
    </div>
  )
}

export default Home