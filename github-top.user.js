// ==UserScript==
// @name         github-top
// @namespace    github-top
// @version      0.0.3
// @description  See top-rated comments in the issue
// @homepageURL  https://github.com/0xC0FFEEC0DE/github-top-comments
// @supportURL   https://github.com/0xC0FFEEC0DE/github-top-comments/issues
// @downloadURL  https://raw.githubusercontent.com/0xC0FFEEC0DE/github-top-comments/master/github-top.user.js
// @updateURL    https://raw.githubusercontent.com/0xC0FFEEC0DE/github-top-comments/master/github-top.user.js
// @author       0xC0FFEEC0DE
// @include      /^https://github.com/(.*)/(.*)/issues/(.*)/
// @license      MIT
// ==/UserScript==

;(function() {
'use strict'

const TOP_LIMIT = 15

;(function main() {
    let ui = new UI()
    let actionPanel = document.querySelector('.gh-header-actions')
    let btn = document.createElement('button')
    btn.className = 'btn btn-sm btn-info ml-2 mr-2'
    btn.textContent = 'Show comment top'
    actionPanel.insertBefore(btn, actionPanel.firstChild)

    let data
    btn.onclick = () => {
        ui.drawTop()
        data = getData()
        //console.table(data)
        if(data.length === 0) {
            return ui.msg('no reactions')
        } else {
            ui.msg(`posts with reactions: ${data.length}`)
        }
        data.slice(0, TOP_LIMIT)
            .forEach(d => ui.append(d))
    }
})()

function UI() { }

UI.prototype.drawTop = function() {
    let body = document.querySelector('body')

    let panel = document.createElement('div')
    panel.style.position = 'fixed'
    panel.style.right = '4px'
    panel.style.bottom = 0
    panel.style['background-color'] = '#f6f8fa'
    panel.style.border = '1px solid #d1d5da'
    panel.style['border-radius'] = '3px'
    panel.style['z-index'] = 42
    panel.style.margin = '5px'
    body.appendChild(panel)

    this.top = document.createElement('ul')
    this.top.style.margin = '5px'
    this.top.style['list-style-type'] = 'none'
    panel.appendChild(this.top)

    this.status = document.createElement('span')
    this.status.style.margin = '5px'
    this.status.textContent = 'loading...'
    panel.appendChild(this.status)
}

UI.prototype.append = function(post) {
    let newLi = document.createElement('li')

    let permalink = document.createElement('a')
    permalink.textContent = '🔗'
    permalink.href = post.link
    permalink.title = 'Go to'
    newLi.appendChild(permalink)

    let div = document.createElement('span')
    post.reactions.forEach(r => div.textContent += ` ${r.react}${r.count} `)
    newLi.appendChild(div)

    this.top.appendChild(newLi)
}

UI.prototype.msg = function(m) {
    this.status.textContent = m
}

function getData() {
    let posts = document.querySelectorAll('.comment')
    let postsWithReactions = Array.prototype.filter.call(posts, p => {
        return p.querySelector('.has-reactions')
    })

    let data = postsWithReactions.map(p => {
        let post = {
            link: p.querySelector('a.link-gray').href,
            reactions: []
        }

        let reactionSection = p.querySelector('.comment-reactions-options')
        post.reactions = Array.prototype.map.call(reactionSection.children, r => {
            let [react, count] = r.innerText.split(' ')
            count = Number.parseInt(count)
            return {
                react,
                count
            }
        })
        return post
    })

    let getLike = d => d.reactions.find(r => r.react === '👍')

    data = data.filter(d => getLike(d))
                .sort((a,b) => {
                    a = getLike(a)
                    b = getLike(b)
                    return b.count - a.count
                })

    return data
}
            
})();
