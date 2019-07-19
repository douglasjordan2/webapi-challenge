import React, { Component } from 'react';
import axios from 'axios';
import { Route, Link } from 'react-router-dom';

class App extends Component {
  state = {
    projects: []
  }

  getProjects = () => {
    axios
      .get('http://localhost:5000/')
      .then(res => this.setState({ projects: res.data }))
      .catch(err => console.log(err))
  }

  componentDidMount() {
    this.getProjects();
  }

  render() {
    return (
      <Container>
        <Header />
        <Route path="/" exact render = { props => (
          this.state.projects.map((project, i) => (
            <Link to = { `/${project.id}` }>
              <Project 
                project = { project }
                index = { i + 1 }
                key = { i }
              />
            </Link>
          ))
        )} />
        <Route path="/:id" exact render = {props => (
          <Project 
            open
            { ...props }
          />
        )} />
        <Route path = "/:id/:actId" exact render = {props => (
          <Action 
            { ...props }
          />
        )} />
      </Container>
    )
  };
}

const Container = props => {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }

  return (
    <div style = { style }>
      { props.children }
    </div>
  )
}

const Header = () => {
  const style = {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '20px'
  }

  return (
    <h1 style = { style }>Projects</h1>
  )
}

class Project extends Component {
  state = {
    project: {},
    actions: [],
  }

  componentDidMount() {
    if(this.props.open) {
      const id = parseInt(this.props.match.params.id)

      axios
        .get(`http://localhost:5000/${id}`)
        .then(res => this.setState({ project: res.data }))
        .then(() => axios
          .get(`http://localhost:5000/${id}/actions`)
          .then(res => this.setState({ actions: res.data }))
          .catch(err => console.log(err))
        )
        .catch(err => console.log(err))
    } else {
      this.setState({ project: this.props.project })
    }
  }
  
  container = {
    border: '2px solid black',
    padding: '20px',
    marginBottom: '20px',
    width: this.props.open ? '400px' : '175px',
    height: this.props.open ? '200px' : '60px',
    cursor: 'pointer',
  }

  deleteProject = () => {
    const id = parseInt(this.props.match.params.id)

    axios
      .delete(`http://localhost:5000/${id}`)
      .then(() => this.props.history.push('/'))
      .catch(err => console.log(err))
  }

  handleChange = e => {
    this.setState({
      newAction: {
        ...this.state.newAction,
        [e.target.name]: e.target.value
      }
    })
  }

  render() { 
    return (
      <div 
        style = { this.container }
      >
        <span>{ this.state.project.id + '. ' + this.state.project.name }</span> <br />
        { this.props.open ? 
          <ul style = {{ listStyle: 'circle', margin: '10px 40px' }}>
            { this.state.actions.map((action, i) => (
              <Link to = { `/${this.state.project.id}/${action.id}` }>
                <li>
                  { action.description }
                </li>
              </Link>
            )) }
          </ul>
        :
            null
        }
      </div>
    )
  }
}

class Action extends Component {
  state = {
    action: {},
    project: null,
    edit: false,
    newAction: {
      description: '',
      notes: ''
    }
  }

  componentDidMount() {
    const { id, actId } = this.props.match.params
    axios
      .get(`http://localhost:5000/${parseInt(id)}/actions/${parseInt(actId)}`)
      .then(res => this.setState({ action: res.data, project: parseInt(id) }))
      .catch(err => console.log(err))
  }

  container = {
    border: '2px solid black',
    padding: '20px',
    marginBottom: '20px',
    width: '400px',
    height: '200px',
    cursor: 'pointer',
    position: 'relative'
  }

  deleteAction = () => {
    axios
      .delete(`http://localhost:5000/${this.state.project}/actions/${this.state.action.id}`)
      .then(() => this.props.history.push(`/${this.state.project}`))
      .catch(err => console.log(err))
  }

  handleChange = e => {
    this.setState({
      newAction: {
        ...this.state.newAction,
        [e.target.name]: e.target.value
      }
    })
  }

  edit = e => {
    e.preventDefault();
    const action = {
      description: this.state.newAction.description || this.state.action.description,
      notes: this.state.newAction.notes || this.state.action.notes
    }

    axios
      .put(`http://localhost:5000/${this.state.project}/actions/${this.state.action.id}`, action)
      .then(() => window.location.reload())
      .catch(err => console.log(err))
  }

  render = () => (
    this.state.edit ?
      <form 
        style = { this.container } 
        onSubmit = { e => this.edit(e) }
      >
        <input 
          type="text"
          name="description"
          value = { this.state.newAction.description }
          onChange = { e => this.handleChange(e) }
          placeholder={ this.state.action.description }
        /><br />
        <input 
          type="text"
          name="notes"
          value = { this.state.newAction.notes }
          onChange = { e => this.handleChange(e) }
          placeholder={ this.state.action.notes }
        /><br />
        <input type="submit" value="Submit"/>
      </form>
    :
    <div style = { this.container }>
      { this.state.action.id }. <span>{ this.state.action.description }</span>
      <br /><br />
      Notes: <span>{ this.state.action.notes }</span>
      <span 
        style = {{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '10px', 
          textDecoration: 'underline', 
          color: 'blue' 
        }}
        onClick = { () => this.deleteAction() }
      >
        delete
      </span>
      <span 
        style = {{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '60px', 
          textDecoration: 'underline', 
          color: 'blue' 
        }}
        onClick = { () => this.setState({ edit: true }) }
      >
        edit
      </span>
    </div>
  )
}

export default App;
