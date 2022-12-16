import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Group,
  Rect,
  Transformer,
} from "react-konva";
import frame from "assets/images/id-card.svg";
import useImage from "use-image";
import styled from "styled-components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useSize } from "ahooks";
import { Box } from "konva/lib/shapes/Transformer";

const IMAGE_WIDTH = 945;
const IMAGE_HEIGHT = 1299;
const AVATAR_Y = 567;
const AVATAR_RADIUS = 247;
const NAME_Y = 980;
const FONT_SIZE = 72;
const GUIDELINE_OFFSET = 5;

const Wrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;
type Snap = "start" | "center" | "end";
type Orientation = "V" | "H";

type SnappingEdge = {
  guide: number;
  offset: number;
  snap: Snap;
};

type GuideStops = {
  vertical: Array<number>;
  horizontal: Array<number>;
};

type ItemBounds = {
  vertical: Array<SnappingEdge>;
  horizontal: Array<SnappingEdge>;
};

type Guide = {
  lineGuide: number;
  diff: number;
  snap: Snap;
  offset: number;
};

type GuideResult = {
  lineGuide: number;
  snap: Snap;
  offset: number;
  orientation: Orientation;
};

type FrameProps = {
  name: string;
  image: HTMLImageElement | null;
};
const Frame = React.forwardRef<Konva.Stage, FrameProps>(
  ({ name, image }, ref) => {
    const [isSelected, setSelected] = useState(true);
    const [frameUrl] = useImage(frame);
    const parentRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const imageRef = useRef<Konva.Image>(null);
    const exportImageRef = useRef<Konva.Image>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const size = useSize(parentRef);

    const scaleRatio = useMemo(() => {
      if (size) {
        return size.width / IMAGE_WIDTH;
      }
      return 1;
    }, [size]);

    const imageRatio = useMemo(() => {
      return IMAGE_WIDTH / IMAGE_HEIGHT;
    }, []);

    useEffect(() => {
      if (trRef.current && imageRef.current) {
        if (image && isSelected) {
          trRef.current.nodes([imageRef.current]);
          trRef.current.getLayer()?.batchDraw();
        }
      }
    }, [image, isSelected]);

    const avatarNode = useMemo(() => {
      const size = AVATAR_RADIUS * 2 * scaleRatio;
      return {
        x: (IMAGE_WIDTH / 2 - AVATAR_RADIUS) * scaleRatio,
        y: (AVATAR_Y - AVATAR_RADIUS) * scaleRatio,
        width: size,
        height: size,
      };
    }, [scaleRatio]);

    // Resize the image to fix the frame,
    // otherwise the transformer will be out of frame
    const imageSize = useMemo(() => {
      let width = 0,
        height = 0;
      if (image && size) {
        width = image.width;
        height = image.height;
        const ratio = image.width / image.height;

        if (ratio >= 1) {
          if (image.width > size.width) {
            width = size.width - 100;
            const scaleRatio = width / image.width;
            height = image.height * scaleRatio;
          }
        } else if (ratio < 1) {
          if (image.height > size.height) {
            height = size.height - 100;
            const scaleRatio = height / image.height;
            width = image.width * scaleRatio;
          }
        }
      }
      return { width, height };
    }, [image, size]);

    function selectImage(e: KonvaEventObject<MouseEvent>) {
      if (e.target.attrs.id === "photo") {
        setSelected(true);
      }
    }

    function onStageClick(e: KonvaEventObject<MouseEvent>) {
      if (e.target.attrs.id === "frame") {
        setSelected(false);
      }
    }

    function copySize() {
      if (imageRef.current && exportImageRef.current) {
        const img = imageRef.current;
        const exImg = exportImageRef.current;

        const { width, height } = img.size();
        const { x: sx, y: sy } = img.scale();
        const { x: px, y: py } = img.position();
        const rotation = img.rotation();

        exImg.size({
          width: width / scaleRatio,
          height: height / scaleRatio,
        });

        exImg.scale({
          x: sx,
          y: sy,
        });

        exImg.position({
          x: px / scaleRatio,
          y: py / scaleRatio,
        });

        exImg.rotation(rotation);
      }
    }

    function getLimitTransformBox(oldBox: Box, newBox: Box): Box {
      if (
        newBox.width < avatarNode.width ||
        newBox.height < avatarNode.height
      ) {
        return oldBox;
      }
      return newBox;
    }

    function getLineGuideStops(): GuideStops {
      return {
        vertical: [
          avatarNode.x - 1,
          avatarNode.x + avatarNode.width - 1,
        ],
        horizontal: [
          avatarNode.y,
          avatarNode.y + avatarNode.height,
        ],
      };
    }

    function getObjectSnappingEdges(node: Konva.Node): ItemBounds {
      var box = node.getClientRect();
      var absPos = node.absolutePosition();

      return {
        vertical: [
          {
            guide: Math.round(box.x),
            offset: Math.round(absPos.x - box.x),
            snap: "start",
          },
          {
            guide: Math.round(box.x + box.width / 2),
            offset: Math.round(absPos.x - box.x - box.width / 2),
            snap: "center",
          },
          {
            guide: Math.round(box.x + box.width),
            offset: Math.round(absPos.x - box.x - box.width),
            snap: "end",
          },
        ],
        horizontal: [
          {
            guide: Math.round(box.y),
            offset: Math.round(absPos.y - box.y),
            snap: "start",
          },
          {
            guide: Math.round(box.y + box.height / 2),
            offset: Math.round(absPos.y - box.y - box.height / 2),
            snap: "center",
          },
          {
            guide: Math.round(box.y + box.height),
            offset: Math.round(absPos.y - box.y - box.height),
            snap: "end",
          },
        ],
      };
    }

    function getGuides(
      lineGuideStops: GuideStops,
      itemBounds: ItemBounds
    ): Array<GuideResult> {
      const resultV: Array<Guide> = [];
      const resultH: Array<Guide> = [];

      lineGuideStops.vertical.forEach((lineGuide) => {
        itemBounds.vertical.forEach((itemBound) => {
          var diff = Math.abs(lineGuide - itemBound.guide);
          // if the distance between guild line and object snap point is close we can consider this for snapping
          if (diff < GUIDELINE_OFFSET) {
            resultV.push({
              lineGuide: lineGuide,
              diff: diff,
              snap: itemBound.snap,
              offset: itemBound.offset,
            });
          }
        });
      });

      lineGuideStops.horizontal.forEach((lineGuide) => {
        itemBounds.horizontal.forEach((itemBound) => {
          var diff = Math.abs(lineGuide - itemBound.guide);
          if (diff < GUIDELINE_OFFSET) {
            resultH.push({
              lineGuide: lineGuide,
              diff: diff,
              snap: itemBound.snap,
              offset: itemBound.offset,
            });
          }
        });
      });

      const guides: Array<GuideResult> = [];

      // find closest snap
      const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
      const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
      if (minV) {
        guides.push({
          lineGuide: minV.lineGuide,
          offset: minV.offset,
          orientation: "V",
          snap: minV.snap,
        });
      }
      if (minH) {
        guides.push({
          lineGuide: minH.lineGuide,
          offset: minH.offset,
          orientation: "H",
          snap: minH.snap,
        });
      }
      return guides;
    }

    function drawGuides(guides: Array<GuideResult>) {
      if (layerRef.current) {
        const layer = layerRef.current;
        guides.forEach((lg) => {
          if (lg.orientation === "H") {
            const line = new Konva.Line({
              points: [-6000, 0, 6000, 0],
              stroke: "rgb(0, 161, 255)",
              strokeWidth: 1,
              name: "guid-line",
              dash: [4, 6],
            });
            layer.add(line);
            line.absolutePosition({
              x: 0,
              y: lg.lineGuide,
            });
          } else if (lg.orientation === "V") {
            const line = new Konva.Line({
              points: [0, -6000, 0, 6000],
              stroke: "rgb(0, 161, 255)",
              strokeWidth: 1,
              name: "guid-line",
              dash: [4, 6],
            });
            layer.add(line);
            line.absolutePosition({
              x: lg.lineGuide,
              y: 0,
            });
          }
        });
      }
    }

    function onLayerDragMove() {
      if (layerRef.current && imageRef.current) {
        const layer = layerRef.current;
        const image = imageRef.current;
        // clear all previous lines on the screen
        layer.find(".guid-line").forEach((l) => l.destroy());

        // find possible snapping lines
        var lineGuideStops = getLineGuideStops();
        // find snapping points of current object
        var itemBounds = getObjectSnappingEdges(image);

        // now find where can we snap current object
        var guides = getGuides(lineGuideStops, itemBounds);

        // do nothing of no snapping
        if (!guides.length) {
          return;
        }

        drawGuides(guides);

        var absPos = image.absolutePosition();
        // now force object position
        guides.forEach((lg) => {
          switch (lg.snap) {
            case "start": {
              switch (lg.orientation) {
                case "V": {
                  absPos.x = lg.lineGuide + lg.offset;
                  break;
                }
                case "H": {
                  absPos.y = lg.lineGuide + lg.offset;
                  break;
                }
              }
              break;
            }
            case "center": {
              switch (lg.orientation) {
                case "V": {
                  absPos.x = lg.lineGuide + lg.offset;
                  break;
                }
                case "H": {
                  absPos.y = lg.lineGuide + lg.offset;
                  break;
                }
              }
              break;
            }
            case "end": {
              switch (lg.orientation) {
                case "V": {
                  absPos.x = lg.lineGuide + lg.offset;
                  break;
                }
                case "H": {
                  absPos.y = lg.lineGuide + lg.offset;
                  break;
                }
              }
              break;
            }
          }
        });
        image.absolutePosition(absPos);
      }
    }

    function onLayerDragEnd(e: KonvaEventObject<MouseEvent>) {
      if (layerRef.current) {
        const layer = layerRef.current;
        layer.find(".guid-line").forEach((l) => l.destroy());
      }
    }

    return (
      <div>
        <Wrapper ref={parentRef}>
          {size && (
            <Stage
              width={size.width}
              height={size.width / imageRatio}
              onMouseDown={onStageClick}
              preventDefault={false}
              ref={stageRef}
            >
              <Layer
                ref={layerRef}
                onDragMove={onLayerDragMove}
                onDragEnd={onLayerDragEnd}
              >
                <Rect
                  width={size.width}
                  height={size.width / imageRatio}
                  fill="#ffffff"
                />
                <KonvaImage
                  id="frame"
                  image={frameUrl}
                  width={size.width}
                  height={size.width / imageRatio}
                  x={0}
                  y={0}
                  preventDefault={false}
                />
                <Group
                  clipFunc={(ctx: any) => {
                    ctx.arc(
                      size.width / 2 - 1,
                      (size.height * AVATAR_Y) / IMAGE_HEIGHT,
                      (size.width * AVATAR_RADIUS) / IMAGE_WIDTH,
                      0,
                      Math.PI * 2,
                      false
                    );
                  }}
                >
                  {image && (
                    <KonvaImage
                      onClick={selectImage}
                      onTap={selectImage}
                      onDragStart={selectImage}
                      id="photo"
                      ref={imageRef}
                      image={image}
                      draggable
                      width={imageSize.width}
                      height={imageSize.height}
                      x={(size.width - imageSize.width) / 2}
                      y={
                        ((size.height - imageSize.height) * AVATAR_Y) /
                        IMAGE_HEIGHT
                      }
                      onDragEnd={copySize}
                      onTransformEnd={copySize}
                    />
                  )}
                </Group>
                <Text
                  x={0}
                  width={size.width}
                  y={(size.height * NAME_Y) / IMAGE_HEIGHT}
                  text={name}
                  fill="#FAEE65"
                  fontSize={(size.width * FONT_SIZE) / IMAGE_WIDTH}
                  align="center"
                  fontFamily="VL Selphia"
                  preventDefault={false}
                />
                {/* <Line
                  points={[
                    avatarNode.x - 1,
                    0,
                    avatarNode.x - 1,
                    IMAGE_HEIGHT * scaleRatio,
                  ]}
                  stroke="rgb(0, 161, 255)"
                  strokeWidth={1}
                  dash={[4, 6]}
                />
                <Line
                  points={[
                    (IMAGE_WIDTH / 2) * scaleRatio,
                    0,
                    (IMAGE_WIDTH / 2) * scaleRatio,
                    IMAGE_HEIGHT * scaleRatio,
                  ]}
                  stroke="rgb(0, 161, 255)"
                  strokeWidth={1}
                  dash={[4, 6]}
                />
                <Line
                  points={[
                    avatarNode.x + avatarNode.width - 1,
                    0,
                    avatarNode.x + avatarNode.width - 1,
                    IMAGE_HEIGHT * scaleRatio,
                  ]}
                  stroke="rgb(0, 161, 255)"
                  strokeWidth={1}
                  dash={[4, 6]}
                />
                <Line
                  points={[
                    0,
                    avatarNode.y,
                    IMAGE_WIDTH * scaleRatio,
                    avatarNode.y,
                  ]}
                  stroke="rgb(0, 161, 255)"
                  strokeWidth={1}
                  dash={[4, 6]}
                />
                <Line
                  points={[
                    0,
                    AVATAR_Y * scaleRatio,
                    IMAGE_WIDTH * scaleRatio,
                    AVATAR_Y * scaleRatio,
                  ]}
                  stroke="rgb(0, 161, 255)"
                  strokeWidth={1}
                  dash={[4, 6]}
                />
                <Line
                  points={[
                    0,
                    avatarNode.y + avatarNode.height,
                    IMAGE_WIDTH * scaleRatio,
                    avatarNode.y + avatarNode.height,
                  ]}
                  stroke="rgb(0, 161, 255)"
                  strokeWidth={1}
                  dash={[4, 6]}
                /> */}
                {image && isSelected && (
                  <Transformer
                    id="transformer"
                    ref={trRef}
                    centeredScaling={true}
                    keepRatio={true}
                    boundBoxFunc={getLimitTransformBox}
                    enabledAnchors={[
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                    ]}
                  />
                )}
              </Layer>
            </Stage>
          )}
        </Wrapper>

        <Stage
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          ref={ref}
          style={{ display: "none" }}
        >
          <Layer>
            <Rect width={IMAGE_WIDTH} height={IMAGE_HEIGHT} fill="#ffffff" />
            <KonvaImage
              image={frameUrl}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              x={0}
              y={0}
            />
            <Group
              clipFunc={(ctx: any) => {
                ctx.arc(
                  IMAGE_WIDTH / 2 - 1,
                  AVATAR_Y,
                  AVATAR_RADIUS,
                  0,
                  Math.PI * 2,
                  false
                );
              }}
            >
              {image && (
                <KonvaImage
                  ref={exportImageRef}
                  image={image}
                  width={imageSize.width / scaleRatio}
                  height={imageSize.height / scaleRatio}
                  x={(IMAGE_WIDTH - imageSize.width / scaleRatio) / 2}
                  y={
                    ((IMAGE_HEIGHT - imageSize.height / scaleRatio) *
                      AVATAR_Y) /
                    IMAGE_HEIGHT
                  }
                />
              )}
            </Group>
            <Text
              x={0}
              width={IMAGE_WIDTH}
              y={NAME_Y}
              text={name}
              fill="#FAEE65"
              fontSize={FONT_SIZE}
              align="center"
              fontFamily="VL Selphia"
            />
          </Layer>
        </Stage>
      </div>
    );
  }
);

Frame.displayName = "Frame";
export default Frame;
