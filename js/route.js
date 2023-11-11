function dfs(src, trg, d) {
	data = JSON.parse(JSON.stringify(d))
	let ways = []
	let costs = []
	let stack_w = new Set()
	let stack_c = []
	let el = getElement(src, data)
	stack_w.add(el.ip)
	stack_c.push(0)
	local_dfs(el, trg, stack_w, stack_c, costs, ways, data)
	return getDataWay(find_easy_way(ways, costs), data)
}

function find_easy_way(ways, costs) {
	let min_cost = Math.min(...costs)
	let min_way = 0
	let min_way_iter = 0
	let check = false
	for(let iter = 0; iter < ways.length; iter++) {
		if (costs[iter] == min_cost) {
			if(!check) {min_way = ways[iter].length; check = true}
			if (min_way >= ways[iter].length) {
				min_way_iter = iter
				min_way = ways[iter].length
			}
		}
	}
	return ways[min_way_iter]
}

function local_dfs(data_el, trg, stack_w, stack_c, costs, ways, data) {
	if(wayFound(ways, costs, stack_w, stack_c, data_el, trg)) {return}
	for(let step of getWays(data_el)) {
		if(!stack_w.has(step.gw_ip)) { 
			let ip = step.gw_ip
			let cost = step.metric
			stack_w.add(ip)
			stack_c.push(cost)
			let next_el = getElement(ip, data)
			local_dfs(next_el, trg, stack_w, stack_c, costs, ways, data)
			stack_w.delete(ip)
			stack_c.pop()
		}
	}
}

function getDataWay(ipWay, data) {
	let wayData = []
	for(let i = 0; i < ipWay.length; i++) {
	  let node = getElement(ipWay[i], data)
	  let node_way = []
	  for(let way of node.way) {
		if(i-1 >= 0 && way.dest_net == ipWay[i-1]) {
		  node_way.push(way)
		} else if(i+1 < ipWay.length && way.dest_net == ipWay[i+1]) {
		  node_way.push(way)
		}
	  }
	  node.way = node_way
	  wayData.push(node)
	}
	return wayData
}

function getElement(ip, data) {
	for (let el of data) {
		if(ip == el.ip) {
			return el
		}		
	}
	return null
}

function addOrChange(el, data) {
	let exist = false
	for(let i in data) {
		if(data[i].ip == el.ip) {
			exist = true
			data[i] = el
		}
	}
	if (!exist) {
		data.push(el)
	}
}

function wayFound(ways, costs, stack_w, stack_c, el, trg) {
	if(el.ip == trg) {
		let res = getWayAndCost(stack_w, stack_c)
		ways.push(res[0])
		costs.push(res[1])
		return true
	}
	return false
}

function getWayAndCost(stack_w, stack_c) {
	let way = []
	let cost = 0
	for(let item of stack_w) {
		way.push(item)
	}
	for(let item of stack_c) {
		cost += item
	}
	return [way, cost]
}


function getWays(data_el) {
	let ways = []
	let unique_ways = new Set()
	for (let way of data_el.way) {
		if(!unique_ways.has(way.gw_ip)) {
			unique_ways.add(way.gw_ip)
			ways.push(way)
		}
	}
	return ways
}

function deleteNode(nodeIp, data) {
	let newData = []
	for(let node of data) {
	  if(node.ip == nodeIp) {
		continue
	  } else {
		let nodeWay = []
		for(let way of node.way) {
		  if(way.dest_net != nodeIp && way.gw_ip != nodeIp) {
			nodeWay.push(way)
		  }
		}
		node.way = nodeWay
		newData.push(node)
	  }
	}
	return newData
  }