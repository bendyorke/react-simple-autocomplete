import React, { Component, PropTypes } from 'react'

class Autocomplete extends Component {
  static propTypes = {
    placeholder: PropTypes.string, 
    defaultInputValue: PropTypes.any,  
    items: PropTypes.array,
    filter: PropTypes.func,
    sort: PropTypes.any,
    limit: PropTypes.number,
    renderMenu: PropTypes.func,
    renderItem: PropTypes.func,
    onSelectItem: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onSubmit: PropTypes.func,   // onSubmit will be called when an item is selected or when users hit enter with self-defined value
    submitOnSelect: PropTypes.bool,
    onlyAllowsValueInItems: PropTypes.bool,
    children: PropTypes.element,
  };

  static defaultProps = {
    placeholder: 'Enter a value',
    defaultInputValue: '',
    items: [],
    submitOnSelect: true, // call onSubmit when an item is selected
    onlyAllowsValueInItems: false,  // if user enter a value that is not in the items, the onSubmit function will not be triggered.
    filter: (item, query) => item.toLowerCase().includes(query.toLowerCase()),
    sort: () => {},
    renderMenu: ({items}) => <ul>{items}</ul>,
    renderItem: ({item, highlighted}) => highlighted
      ? <em><li>{item}</li></em>
      : <li>{item}</li>,
    children: <input type="text" />,
  };

  state = {
    open: false,
    highlighted: -1,
  };

  get input() {
    return this.refs.input
  }

  get items() {
    const { items, filter, sort, limit } = this.props
    const { value = '' } = this.refs.input || {}

    return items
      .filter(item => filter(item, value))
      .sort(sort)
      .slice(0, limit)
  }

  componentWillMount() {
    this._blur = true
  };
  
  componentDidMount() {
      const { defaultInputValue } = this.props;
      const { input } = this.refs;
       
      if ( defaultInputValue ) {
          input.value = defaultInputValue;
      }        
  }

  open = () => {
    this.setState({open: true})
  };

  close = () => {
    this.setState({open: false})
  };

  // menu
  handleMouseLeave = _event => {
    this.setState({highlighted: -1})
  };

  // item
  handleMouseEnter = index => _event => {
    this.setState({highlighted: index})
  };

  // item
  handleMouseDown = () => {
    this._blur = false    
  };


  // item
  handleSelectItem = item => event => {
    const { onSelectItem, onSubmit, submitOnSelect } = this.props
    const { input } = this.refs

    if (item){
        this.setState({ highlighted: -1 })  // Once the item is selected, remove the highlighted
    
        /**
         * call onSelectItem if it exists
         */
        const selectHandler = onSelectItem && onSelectItem(item, event);
        
        // update the input value
        input.value = item

        /**
         * After updating the value, we need to trigger an onChange event.
         * Can also trigger by returning true in onSelectItem
         */
        if (selectHandler) {      
          const changeEvent = new Event('input', { bubbles: true })
          input.dispatchEvent(changeEvent)
        }
              
        /**
         * Close the menu and allow blur events
         * to continue,
         */
        setTimeout(() => {
          input.focus()
          this._blur = true
          this.close()
          if (submitOnSelect){
            // call save function
            onSubmit && onSubmit(input.value);    
          }       
        })    
    }  
       

    
  };

  // children
  handleChange = event => {
    const { onChange } = this.props;
    const { input } = this.refs;
    
    onChange && onChange(event, input.value)
  };
  
  // children
  handleFocus = event => {
    const { onFocus } = this.props

    this.open()
    onFocus && onFocus(event)
  };

  // children
  handleBlur = event => {
    const { onBlur } = this.props
    const { input } = this.refs

    if (!this._blur) return

    this.close()
    onBlur && onBlur(event, input.value)
  };

  // children
  handleKeyDown = event => {
    const { highlighted } = this.state
    const { onSubmit, onlyAllowsValueInItems } = this.props
    const { input } = this.refs

    this.open()

    switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      const next = Math.min(highlighted + 1, this.items.length - 1)
      this.setState({ highlighted: next })
      return

    case 'ArrowUp':
      event.preventDefault()
      const prev = Math.max(highlighted - 1, -1)
      this.setState({ highlighted: prev })
      return

    case 'Enter':
      event.preventDefault()
      if (this.items.length > 0 && highlighted > -1) {
        this.handleSelectItem(this.items[highlighted])(event)                
      } else if (!onlyAllowsValueInItems) {
        onSubmit && onSubmit(input.value)
      }    
	  
      return

    case 'Escape':
      this.close()
      return

    default:
      // TODO: Add debounce
      setTimeout(() => this.forceUpdate())
      return
    }
  };

  render() {
    const {      
      placeholder,
      children,
      items,
      filter,
      sort,
      renderMenu: Menu,
      renderItem: Item,
      ...props,
    } = this.props

    const renderedItems = this.items.map((item, index) => {
      const highlighted = this.state.highlighted === index
      return React.cloneElement(Item({item, index, highlighted}), {
        onMouseEnter: this.handleMouseEnter(index),
        onMouseDown: this.handleMouseDown,
        onClick: this.handleSelectItem(item),
        key: `${index}${item.substr(0,3)}`,
      })
    })

    const renderedMenu = React.cloneElement(Menu({items: renderedItems}), {
      onMouseLeave: this.handleMouseLeave,
    })

    return (
      <div {...props}>
        {React.cloneElement(children, {
          onKeyDown: this.handleKeyDown,
          onFocus: this.handleFocus,
          onChange: this.handleChange,
          onBlur: this.handleBlur,        
          placeholder: placeholder,           
          ref: 'input',
        })}

        {this.state.open && renderedMenu}
      </div>
    )
  }
}

export default Autocomplete
