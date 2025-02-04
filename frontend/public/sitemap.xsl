<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap - Test My Russian</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 75rem; margin: 0 auto; padding: 2rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
          th { border-bottom: 2px solid #ddd; }
          h1 { color: #2563eb; }
          .priority-high { color: #059669; }
          .priority-medium { color: #0284c7; }
          .priority-low { color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>Test My Russian - XML Sitemap</h1>
        <p>This sitemap contains <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.</p>
        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
            <th>Change Frequency</th>
            <th>Priority</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
              <td><xsl:value-of select="sitemap:lastmod"/></td>
              <td><xsl:value-of select="sitemap:changefreq"/></td>
              <td>
                <xsl:choose>
                  <xsl:when test="sitemap:priority &gt;= 0.8">
                    <span class="priority-high"><xsl:value-of select="sitemap:priority"/></span>
                  </xsl:when>
                  <xsl:when test="sitemap:priority &gt;= 0.5">
                    <span class="priority-medium"><xsl:value-of select="sitemap:priority"/></span>
                  </xsl:when>
                  <xsl:otherwise>
                    <span class="priority-low"><xsl:value-of select="sitemap:priority"/></span>
                  </xsl:otherwise>
                </xsl:choose>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>