import Link from 'next/link';
import React from 'react';

export default function NotFound() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
            <Link href="/">
                Go back to Homepage
            </Link>
        </div>
    );
} 