'use strict'
var pathFn = require('path')
var fs = require('hexo-fs')
var axios = require('axios')

async function bangumi(args) {
    var path = pathFn.join(hexo.source_dir, args[0])

    fs.exists(path).then(function (exist) {
        if (!exist) {
            hexo.log.error('Include file not found!')
        }
    })

    const data = await fs.readFile(path)
    if (!data) {
        hexo.log.warn('Include file empty.')
        return
    }

    const bangumis = JSON.parse(data)
    const { uid } = bangumis
    const BASEURL = 'https://api.bgm.tv'
    const options = {
        'headers':
            { 'User-Agent': 'xizeyoupan/hexo-theme-stun (https://github.com/xizeyoupan/hexo-theme-stun)' }
    }

    let allData = []

    const limit = 50
    let result = await axios.get(`${BASEURL}/v0/users/${uid}/collections?limit=${limit}&offset=0`, options);
    result = result.data

    for (let each of result.data) {
        allData.push(each)
    }
    const total = result.total
    console.log(total)
    const num = Math.ceil(total / limit)

    for (let i = 1; i < num; i++) {
        result = await axios.get(`${BASEURL}/v0/users/${uid}/collections?limit=${limit}&offset=${i * limit}`, options);
        result = result.data

        for (let each of result.data) {
            allData.push(each)
        }
    }
    console.log(allData.length)

    const type_map = {
        1: "书籍",
        2: "动画",
        3: "音乐",
        4: "游戏",
        6: "三次元",
    }

    const collection_type_map = {
        1: "想看",
        2: "看过",
        3: "在看",
        4: "搁置",
        5: "抛弃",
    }

    allData = allData.map(item => {
        return {
            "id": item.subject.id,
            "title": item.subject.name,
            "type": type_map[item.subject_type],
            "cover": item.subject.images.common,
            "score": item.subject.score,
            "des": item.subject.short_summary,
            "state": collection_type_map[item.type],
            "collect": item.subject.collection_total,
            "totalCount": `共${item.subject.eps}话`,
            "myComment": item.comment || '',
            "myStars": item.rate
        }
    })

    console.log(allData)

    return `<script> window.bangumis=${JSON.stringify(allData)} </script>`

}

hexo.extend.tag.register('bangumis', bangumi, { ends: false, async: true })
