const oImgFileSelector = document.querySelector('#imgFileSelector')
const oOriginImgPreview = document.querySelector('#originImgPreview')
const oCompressedImgPreview = document.querySelector('#compressedImgPreview')
const reader = new FileReader()

let imgFile = null
let quality = 90
let compressedImgSrc = ''

const IMG_TYPES = {
	'image/jpeg': 'image/jpeg',
	'image/png': 'image/png',
	'image/gif': 'image/gif',
}

const init = () => {
	bindEvent()
}

function bindEvent() {
	oImgFileSelector.addEventListener('change', handleFileSelectorChange, false)
}

function handleFileSelectorChange(e) {
	// console.log(e.target.files)
	imgFile = e.target.files[0]

	// console.log(imgFile)

	if (!imgFile || !IMG_TYPES[imgFile.type]) {
		alert('请选择正确格式的图片')
		setImgFileEmpty()
		return
	}

	setImgPreview(imgFile)
}

function setImgFileEmpty() {
	oImgFileSelector.value = ''
	imgFile = null

	setPreviewVisible(oImgFileSelector, false)
	setPreviewVisible(oCompressedImgPreview, false)
}

function setImgPreview(imgFile) {
	if (imgFile instanceof File) {
		reader.onload = async () => {
			const originImgSrc = reader.result
			// console.log(originImgSrc)
			// 压缩
			// const compressedImgSrc = await createCompressedImage({
			// 	imgSrc: originImgSrc,
			// 	quality,
			// 	type: imgFile.type,
			// })

			await createCompressedImage({
				imgSrc: originImgSrc,
				type: imgFile.type,
			})

			// console.log(compressedImgSrc)

			oOriginImgPreview.src = originImgSrc
			oCompressedImgPreview.src = compressedImgSrc

			setPreviewVisible(oOriginImgPreview, true)
			setPreviewVisible(oCompressedImgPreview, true)

			console.log(originImgSrc.length, compressedImgSrc.length, quality)
		}

		reader.readAsDataURL(imgFile)
	}
}

function createCompressedImage({ imgSrc, type }) {
	// 需要一个画布(canvas)
	// 需要一个图片对象，将已经转换为base64的图片数据赋值给此对象
	// 将这张图片绘制到画布中
	// 然后通过canvas将图片的质量缩小
	const oCan = document.createElement('canvas')
	const oImg = document.createElement('img')
	// 画布上下文
	const ctx = oCan.getContext('2d')
	oImg.src = imgSrc

	return new Promise((resolve) => {
		oImg.onload = () => {
			// 获取宽高
			const imgWidth = oImg.width
			const imgHeight = oImg.height

			oCan.width = imgWidth
			oCan.height = imgHeight

			ctx.drawImage(oImg, 0, 0, imgWidth, imgHeight)

			// 生成压缩图片
			// const compressedImgSrc = oCan.toDataURL(type, quality / 100)
			doCompress(oCan, imgSrc, type)
			resolve(compressedImgSrc)
		}
	})
}

function doCompress(canvas, imgSrc, type) {
	compressedImgSrc = canvas.toDataURL(type, quality / 100)

	if (compressedImgSrc.length >= imgSrc.length && quality > 10) {
		quality -= 10
		doCompress(canvas, imgSrc, type)
	}
}

function setPreviewVisible(node, visible) {
	switch (visible) {
		case true:
			node.classList.remove('hide')
			node.classList.add('show')
			break
		case false:
			node.classList.remove('show')
			node.classList.add('hide')
			break
		default:
			break
	}
}

init()
