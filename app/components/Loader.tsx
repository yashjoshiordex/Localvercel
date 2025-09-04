import React from 'react'
import {Spinner} from '@shopify/polaris';

const Loader = () => {
  return (
      <div className="d-flex justify-content-center align-items-center flex-column">
        <Spinner accessibilityLabel="Loading" size="large" />
        <p className="fw-600 fs-5 mt-3">Loading...</p>
      </div>    
  )
}

export default Loader