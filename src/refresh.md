1. If the slicer has a forced startup date, then that is always prioritised. E.g. setting for this week will always show this week.
2. if the slicer has a saved state, the forced startup overrides it. The slicer is initialised to the forced startup range.
3. if a bookmark is activated across pages, it overrides the forced startup
4. if the slicer is synced, it returns to the synced state if there is no forced startup
5. if there is s startup state, it is the default start range for the slicer.
6. if the slicer is not synced and default behaviour, then it has the standard power bi behviour.
7. otherwise it behaves like Power BI Default slicers