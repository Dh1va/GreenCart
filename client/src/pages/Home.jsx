import React from 'react'
import MainBanner from '../components/MainBanner'
// import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import ShopByCategory from '../components/ShopByCategory'
import Testimonials from '../components/Testimonials'

const Home = () => {
  
  return (
    <div className='mt-10'>
        <MainBanner/>
        {/* <Categories/> */}
        <ShopByCategory/>
        <BestSeller/>
         <div className="-mx-6 md:-mx-16 lg:-mx-24 xl:-mx-32">
          <Testimonials />
         </div>
        {/* <BottomBanner/>
        <NewsLetter/> */}
    </div>
  )
}

export default Home