# Search and browse

DSP-APP offers the possibility for the user to search in 3 different ways: **full-text** search, **advanced** search, and **expert** search (Gravsearch query). The search bar is always available in the header of each page, whether logged in or out.

![Search bar with the 3 search modes: full-text, advanced, and expert](../../assets/images/search-3modes.png)

## Full-text search

DSP offers a full-text search that searches through all text values and labels of resources based on one or several terms (or phrase) entered in the search bar.
It returns data that matches the search conditions.
By default, the search is performed in all projects stored in DSP. However, it is possible to filter by project using the "Filter by project" menu on the left side of the search bar.

![Filter your full-text search by specific project](../../assets/images/search-fulltext-filterByProject.png)*<https://admin.dasch.swiss> - Search 1: Search in one specific project or all projects*

When clicking on the search bar, the search history panel is displayed. The last **10** searches are registered. Click on one search item to perform the same full-text search again. It is also possible to clear the search history list (*Clear list* button at the bottom of the panel or the *x* at the end of each line).

![Search history panel](../../assets/images/search-history.png)*Search history list is accessible for the full-text search from any webpage.*

### Search rules

* A search value must have a minimum length of **3** characters.

* All terms are interpreted as **lowercase** characters. E.g. "My dearest Maria" is interpreted as "my dearest maria".

* By default, the logical operator `OR` is used when submitting several search terms. I.e. the name "George Sand" is searched as "george" OR "sand". The database will return all results that include the terms "George Sand", "george", "sand". To find the exact name "George Sand", the term must be surrounded by "quotes".

* Each term separated by a **whitespace** is considered a single term. E.g. the term "mon petit chat" will be searched as "mon" OR "petit" OR "chat". To find the exact phrase "mon petit chat", the phrase must be surrounded by "quotes".

### Special syntax

Special characters can be used in order to search for specific text patterns.

Here is the list of characters with special meaning: +, -, &&, ||, !, (, ), [, ], {, }, ^, ", ~, *, ?, :, \, /

For more information about them, please read the [Lucene documentation](https://lucene.apache.org/core/7_7_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html).

> If you want to search for these special characters **explicitly**, note that the punctuation marks `,` and `.` are **NOT** eliminated and stay with the term where they occured. E.g. "To be, or not to be, that is the question." -> when searching for `be` the term `be,` (comma included) won't be found (and thus the entire phrase). We recommend to use the special character `*` or `?` to find the term. E.g. "be*" or "be?"
Another example, if you search for the term "(1995)" that includes parenthesis in this case, search for "*1995*" or "?1995?".

**Focus on the most common used characters:**

* `*` (asterisk) can be used as a wildcard symbol for zero, one, or multiple characters. E.g. pari* ("Paris", "Parisian", "parity", "parish", etc.)
* `?` (question mark) can be used as a wildcard symbol for a single character. E.g. Bern? ("Berne", "Bernt")
* `""` (quotation marks) searches for the whole pattern. E.g. "Bern" (the exact term "Bern")

In order to make easier searches and independent from special characters, we recommand to use the advanced search. It will narrow down the search and accept special letters or characters. E.g. the exact writing `rāmāyaṇī` will be accepted and found.

### Include special characters in the search

If one of the above characters should be included in the search - without any special meaning - it needs to be escaped with the character `\` .

E.g. You want to search for "Notre-Dame de Paris", you will type "Notre`\-`Dame de Paris".

### Conversion

Alphabetic, numeric, symbolic, and diacritical Unicode characters which are not in the [first 127 ASCII characters](https://learn.parallax.com/support/reference/ascii-table-0-127) (the "Basic Latin" Unicode block) are converted into their ASCII equivalents, if one exists, e.g. é or ä are converted into e and a.

One exception: `r̥` must be replaced by `rr`.

---

## Advanced search

![Advanced search link is findable in the search menu at the right of the full-text search field.](../../assets/images/search-advanced-link.png)

The advanced search allows the creation of complex queries using a form.
The form creates a string representing a Gravsearch (SPARQL) query to be sent to DSP-API.

A query consists of the following elements:

- selection of the data model
- selection of a resource class belonging to the selected data model (optional)
- specification of properties, comparison operators, and values (optional).

Although the selection of a resource or a property or both are optional, either a resource class has to be selected or at least one property has to be specified, otherwise, the query is not considered valid and cannot be submitted.

![Search 2: Advanced search offers many filter combinations and is a powerful search tool.](../../assets/images/search-advanced.png)*<https://admin.dasch.swiss> - Search 2: Advanced search offers many filter combinations and is a powerful search tool.*

### Comparison Operators

Depending on the value type of the chosen property,
one or more of the following comparison operators can be selected:

- `is equal to`: value equality: same number, exact same string, an overlap of date periods, same target resource.
- `is not equal to`: value inequality: not same number, not exact same string, no overlap of date periods, not same target resource.
- `is greater than`: value comparison: number is greater than search value, date period begins after search value.
- `is greater than or equal to` value equality/value comparison: number is equal to or greater than search value, an overlap of date periods or date period begins after search value.
- `is less than`: value comparison: number is less than search value, date period ends before search value.
- `is less than or equal to`: value equality/value comparison: number is equal to or less than search value, an overlap of date periods or date period ends before search value.
- `exists`: value for the given property exists.
- `is like`: search value is contained in a text using the SPARQL [REGEX](https://www.w3.org/TR/sparql11-query/#func-regex) function (supports regular expressions).
- `matches`:
  - text property: search value matches the text ([Lucene Query Parser Syntax](https://docs.dasch.swiss/latest/DSP-API/07-lucene/lucene-query-parser-syntax/)).
  - linking property: matches the specified linked resource.

### Search Examples

#### is like (regular Expressions)

The `is like` operator lets the user search for texts that are *like* the search value via the support of regular expressions
In this example, all books are found whose title contains "Narrenschiff" followed by a space and some other characters like "(lat.)" or "(dt.)".

For general information about regular expressions, see this [interactive tutorial](https://regexone.com).

![Advanced search panel with a search example](../../assets/images/advanced-search-regex.png)

#### matches (Lucene Parser Syntax)

Used with a text property, the `matches` operator lets the user search for texts that *match* the search value,
supporting [Lucene Query Parser Syntax](https://docs.dasch.swiss/latest/DSP-API/07-lucene/lucene-query-parser-syntax/).
In this example, all persons are found whose names contain "Ja" and "ob" with a character in between (represented by the wildcard "?").
This search finds "Jacob" as well as "Jakob".

**Note the difference between regular expressions and Lucene parser syntax!**

![Advanced search panel with a search example](../../assets/images/advanced-search-match.png)

#### matches (specifying a Linked Resource)

Used with a linking property, the `matches` operator lets the user search for a linked resource that matches the specified properties.
In this example, the user writes a query looking for all letters that have an author that:

1. was born after January 1st, 1650
1. whose family name is "Bernoulli"

This is different from the "is equal to" operator that lets the user specify a certain person (selected from a list).

![Advanced search panel with a search example](../../assets/images/advanced-search-linked-resource.png)

---

## Expert search

![Expert search link is findable in the search menu at the right of the full-text search field.](../../assets/images/search-expert-link.png)

The expert search can be more powerful than the advanced search, but requires knowing how to use the query language Gravsearch (based on SparQL and developed by the DaSCH team). With Gravsearch, expert users can build searches by combining text-related criteria with any other criteria.

**For example**: you could search for a page in a manuscript that contains a certain element and also mentions a person, who lived in the same country as another person, who is the author of another author.

![Expert search is a text area in which you can create Gravsearch queries.](../../assets/images/search-expert.png)*<https://admin.dasch.swiss> - Search 3: Expert search is a text area in which you can create Gravsearch queries. Here is the default example you can find in the app.*

To learn Gravsearch, go to the DSP-API documentation [&rarr; Gravsearch](https://docs.dasch.swiss/latest/DSP-API/03-endpoints/api-v2/query-language/)
