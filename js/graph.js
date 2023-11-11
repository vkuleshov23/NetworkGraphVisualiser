
class Graph {
  
  constructor(data) {
    this.data = data
    this.array = this.getNodesLinks(this.data)
    this.baseLinks = this.array[1]
    this.baseNodes = this.array[0]
    
    this.nodes = [...this.baseNodes]
    this.links = [...this.baseLinks]
    this.svg = d3.select('svg')
    this.width = this.svg._groups[0][0].clientWidth
    this.height = this.svg._groups[0][0].clientHeight 
    // svg.attr('width', width).attr('height', height)
    
    this.linkElements
    this.nodeElements
    this.textElements
    
    // we use svg groups to logically group the elements together
    this.linkGroup = this.svg.append('g').attr('class', 'links')
    this.nodeGroup = this.svg.append('g').attr('class', 'nodes')
    this.textGroup = this.svg.append('g').attr('class', 'texts')
    
    // we use this reference to select/deselect
    // after clicking the same element twice
    this.selectedId
    
    // simulation setup with all forces
    this.linkForce = d3
      .forceLink()
      .id(function (link) { return link.id})
      .strength(function (link) { return link.strength})

    this.dragDrop = d3.drag().on('start', function (node) {
      node.fx = node.x
      node.fy = node.y
    }).on('drag', function (node) {
      d3
      .forceSimulation()
      .force('link', this.linkForce)
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2)).alphaTarget(0.7).restart()
      node.fx = d3.event.x
      node.fy = d3.event.y
    }).on('end', function (node) {
      if (!d3.event.active) {
        d3
      .forceSimulation()
      .force('link', this.linkForce)
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2)).alphaTarget(0)
      }
      node.fx = null
      node.fy = null
    })

    this.updateSimulation()
  }

  getSimulation() {
    return d3
      .forceSimulation()
      .force('link', this.linkForce)
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
  }
  getNodesLinks(data) {
    let nodes = [] 
    let links = []
    for (let el of data) {
      nodes.push({id: el.ip, label: el.ip, way: el.way})
      this.searchNeighbours(el, links)
    }
    return [nodes, links]
  }
  searchNeighbours(el, links){
    for(let item of el.way) {
      links.push({target: item.gw_ip, source: el.ip, strength: 0.05, cost: el.metric})
    }
  }
  getNeighbours(node) {
    return baseLinks.reduce(function (neighbours, link) {
        if (link.target.id === node.id) {
          neighbours.push(link.source.id)
        } else if (link.source.id === node.id) {
          neighbours.push(link.target.id)
        }
        return neighbours
      },
      [node.id]
    )
  }
  
  isNeighborLink(node, link) {
    return link.target.id === node.id || link.source.id === node.id
  }
  getNodeColor(node, neighbours) {
    if (Array.isArray(neighbours) && neighbours.indexOf(node.id) > -1) {
      return node.level === 1 ? 'blue' : 'green'
    }
  
    return node.level === 1 ? 'red' : 'black'
  }
  getLinkColor(node, link) {
    return this.isNeighborLink(node, link) ? 'green' : 'black'
  }
  getTextColor(node, neighbours) {
    return Array.isArray(neighbours) && neighbours.indexOf(node.id) > -1 ? 'green' : 'black'
  }
  
  resetData() {
    var nodeIds = this.nodes.map(function (node) { return node.id })
  
    this.baseNodes.forEach(function (node) {
      if (nodeIds.indexOf(node.id) === -1) {
        this.nodes.push(node)
      }
    })
  
    this.links = this.baseLinks
  }
  updateData(selectedNode) {
    var neighbours = this.getNeighbours(selectedNode)
    var newNodes = this.baseNodes.filter(function (node) {
      return neighbours.indexOf(node.id) > -1
    })
  
    var diff = {
      removed: this.nodes.filter(function (node) { return newNodes.indexOf(node) === -1 }),
      added: newNodes.filter(function (node) { return this.nodes.indexOf(node) === -1 })
    }
  
    diff.removed.forEach(function (node) { this.nodes.splice(nodes.indexOf(node), 1) })
    diff.added.forEach(function (node) { this.nodes.push(node) })
  
    this.links = this.baseLinks.filter(function (link) {
      return link.target.id === selectedNode.id || link.source.id === selectedNode.id
    })
  }
  clearGraph() {
    this.nodes = []
    this.links = []
    this.updateSimulation()
  }
  selectNode(selectedNode) {
    document.dispatchEvent(new CustomEvent("GetNode", { detail: selectedNode.id} ))
  }
  
  updateGraph() {
    // links
    this.linkElements = this.linkGroup.selectAll('line')
      .data(this.links, function (link) {
        return link.target.id + link.source.id
      })
  
      this.linkElements.exit().remove()
  
    var linkEnter = this.linkElements
      .enter().append('line')
      .attr('stroke-width', 1)
      .attr('stroke', 'rgba(0, 0, 0, 0.5)')
  
      this.linkElements = linkEnter.merge(this.linkElements)
  
    // nodes
    this.nodeElements = this.nodeGroup.selectAll('circle')
      .data(this.nodes, function (node) { return node.id })
  
      this.nodeElements.exit().remove()
  
    var nodeEnter = this.nodeElements
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', function (node) { return node.level === 1 ? 'red' : 'black' })
      .call(this.dragDrop)
      .on('click', this.selectNode)
  
      this.nodeElements = nodeEnter.merge(this.nodeElements)
  
    // texts
    this.textElements = this.textGroup.selectAll('text')
      .data(this.nodes, function (node) { return node.id })
  
      this.textElements.exit().remove()
  
    var textEnter = this.textElements
      .enter()
      .append('text')
      .text(function (node) { return node.label })
      .attr('font-size', 15)
      .attr('dx', 15)
      .attr('dy', 4)
  
      this.textElements = textEnter.merge(this.textElements)
  }

  updateSimulation() {
    this.updateGraph()
    let simulation = this.getSimulation()
    simulation.nodes(this.nodes).on('tick', () => {
      this.nodeElements
        .attr('cx', function (node) { return node.x })
        .attr('cy', function (node) { return node.y })
        this.textElements
        .attr('x', function (node) { return node.x })
        .attr('y', function (node) { return node.y })
        this.linkElements
        .attr('x1', function (link) { return link.source.x })
        .attr('y1', function (link) { return link.source.y })
        .attr('x2', function (link) { return link.target.x })
        .attr('y2', function (link) { return link.target.y })
    })
  
    simulation.force('link').links(this.links)
    simulation.alphaTarget(0.15).restart()
  }
  
}

