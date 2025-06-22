// utils/ViewUtils.js (or inside SubwayMapBuilder)
export function getVisibleBounds(svg) {
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;

    const viewportAspect = rect.width / rect.height;
    const viewBoxAspect = viewBox.width / viewBox.height;

    let visibleWidth, visibleHeight, offsetX = 0, offsetY = 0;

    if (viewportAspect > viewBoxAspect) {
        visibleHeight = viewBox.height;
        visibleWidth = viewBox.height * viewportAspect;
        offsetX = (visibleWidth - viewBox.width) / 2;
    } else {
        visibleWidth = viewBox.width;
        visibleHeight = viewBox.width / viewportAspect;
        offsetY = (visibleHeight - viewBox.height) / 2;
    }

    return {
        left: viewBox.x - offsetX,
        right: viewBox.x + viewBox.width + offsetX,
        top: viewBox.y - offsetY,
        bottom: viewBox.y + viewBox.height + offsetY,
        width: visibleWidth,
        height: visibleHeight
    };
}
