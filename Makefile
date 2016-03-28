.PHONY: run crawl

CONFIG		= configs/stochastik-sose2004.json
START		= 10
NUM_VIDS	= 1

run:
	node timm.js download --config ${CONFIG} --start ${START} --num-videos ${NUM_VIDS}

crawl:
	node timm.js crawl --config ${CONFIG} --start ${START} --num-videos ${NUM_VIDS}