// Merge the array part
function Merge (arr, left, mid, right, temp, key) {
	var i = left, j = mid, n = right, k = 0;
	while (i < mid && j < n) {
		if (arr[i][key] <= arr[j][key])
			temp[k++] = arr[i++];
		else
			temp[k++] = arr[j++];
	}
	while (i < mid)
		temp[k++] = arr[i++];
	while (j < n)
		temp[k++] = arr[j++];
	for (var i = 0; i < k; i++)
		arr[i + left] = temp[i];
}
// MergeSort
function MergeSort (arr, key) {
	var temp = [],
		len = arr.length;
	for (var i = 1; i < len; i *= 2) {
		for (var j = 0; j < len; j += i * 2) {
			if (j + 2 * i < len)
				Merge(arr, j, j + i, j + 2 * i, temp, key);
			else if (j + 2 * i > len && j + i <= len)
				Merge(arr, j, j + i, len, temp, key);
		}
	}
}
