import React from 'react'
import logo from '../assets/logo.svg'
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className='bg-desikit-dark text-white'>
        <div className='container mx-auto px-4 py-10 grid gap-8 lg:grid-cols-4'>
            <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                    <img src={logo} alt='DesiKit logo' className='w-12 h-12'/>
                    <div>
                        <h2 className='text-2xl font-bold'>DesiKit</h2>
                        <p className='text-sm text-desikit-soft'>From Farm to Family</p>
                    </div>
                </div>
                <p className='text-sm text-gray-300 max-w-sm'>Local dairy farmers and vegetable growers connect directly to consumers through fresh delivery, fair prices, and farm-first commerce.</p>
            </div>
            <div>
                <h3 className='font-semibold mb-3'>Explore</h3>
                <ul className='space-y-2 text-sm text-gray-300'>
                    <li><a href='#' className='hover:text-white'>About Us</a></li>
                    <li><a href='#' className='hover:text-white'>Farmer Registration</a></li>
                    <li><a href='#' className='hover:text-white'>Become a Delivery Partner</a></li>
                    <li><a href='#' className='hover:text-white'>Contact Us</a></li>
                </ul>
            </div>
            <div>
                <h3 className='font-semibold mb-3'>Support</h3>
                <ul className='space-y-2 text-sm text-gray-300'>
                    <li><a href='#' className='hover:text-white'>Privacy Policy</a></li>
                    <li><a href='#' className='hover:text-white'>Terms & Conditions</a></li>
                    <li><a href='#' className='hover:text-white'>Help Center</a></li>
                </ul>
            </div>
            <div>
                <h3 className='font-semibold mb-3'>Connect</h3>
                <p className='text-sm text-gray-300'>ishuy066@gmail.com</p>
                <p className='text-sm text-gray-300'>+91 7988826890</p>
                <div className='flex items-center gap-4 mt-4 text-2xl text-gray-300'>
                    <a href='#' className='hover:text-white'><FaFacebook/></a>
                    <a href='#' className='hover:text-white'><FaInstagram/></a>
                    <a href='#' className='hover:text-white'><FaLinkedin/></a>
                </div>
            </div>
        </div>
        <div className='border-t border-white/10 py-4'>
            <div className='container mx-auto text-center text-sm text-gray-400'>
                © 2026 DesiKit. Empowering farmers and fresh delivery every day.
            </div>
        </div>
    </footer>
  )
}

export default Footer
