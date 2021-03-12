import React, { Fragment, useState} from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2:''
  })

  const { name, email, password, password2 } = formData;

  const onChange = e => setFormData({...formData, [e.target.name]: e.target.value})
  const onSubmit = async e => {
    e.preventDefault()
    if(password !== password2) {
      console.log('Passwords do not match')
    } else {
      const newUser = {
        name,
        email,
        password
      }
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        }
        const body = JSON.stringify(newUser)
        const res = await axios.post('/api/users', body, config)
        console.log(res.data)
      } catch (err) {
        console.error(err.response.data)
      }
    }
    // console.log(formData)
    // setFormData({
    //   name: '',
    //   email: '',
    //   password: '',
    //   password2: ''
    // })
  }

   return (
    <Fragment>
    <h1 className="large text-primary">Sign Up</h1>
      <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
      <form className="form"  onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input type="text" placeholder="Name" 
          onChange={e => onChange(e)}
          name="name" required 
          value={name}/>
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email Address" 
          onChange={e=> onChange(e)} value={email} name="email" required />
          <small className="form-text">
              This site uses Gravatar so if you want a profile image, use a
            Gravatar email
            </small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            onChange={e=> onChange(e)}
            name="password"
            value={password}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            onChange={e => onChange(e)}
            value={password2}
            required
            minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <a href="/login">Sign In</a>
      </p>
      </Fragment>
   )
}

export default Register;
