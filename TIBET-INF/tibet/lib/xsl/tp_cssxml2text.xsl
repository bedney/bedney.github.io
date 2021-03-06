<?xml version="1.0" encoding="UTF-8"?>

<!--	This stylesheet convert 'CSS XML' generated by the
		TPCSSStyleSheet type in TIBET into two forms:

		1. The native CSS format.
		2. On IE6, a JavaScript 'selector map' that is used for runtime
			CSS2-like selector behavior.
-->

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:css="http://www.technicalpursuit.com/2006/CSS"
	xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	xmlns:html="http://www.w3.org/1999/xhtml">


	<!-- We make sure that any html:style or html:script elements that we
			generate have CDATA sections wrapping their content. -->
	<xsl:output cdata-section-elements="html:style html:script"/>

	
	<!-- A set of parameters that give the browser major, minor and
			patch version numbers. These default to Mozilla 1.7.5
			(Firefox 1.0) -->
	<xsl:param name="browser" select="'moz'"/>
	<xsl:param name="revMajor" select="1"/>
	<xsl:param name="revMinor" select="7"/>
	<xsl:param name="revPatch" select="5"/>


	<!-- A template that can replace string character sequences whole -->
	<xsl:template name="replaceCharsInString">
		<xsl:param name="stringIn"/>
		<xsl:param name="charsIn"/>
		<xsl:param name="charsOut"/>

		<xsl:choose>

			<xsl:when test="contains($stringIn,$charsIn)">
				<xsl:value-of select="concat(substring-before($stringIn,$charsIn),$charsOut)"/>
				<xsl:call-template name="replaceCharsInString">
					<xsl:with-param name="stringIn" select="substring-after($stringIn,$charsIn)"/>
					<xsl:with-param name="charsIn" select="$charsIn"/>
					<xsl:with-param name="charsOut" select="$charsOut"/>
				</xsl:call-template>
			</xsl:when>

			<xsl:otherwise>
				<xsl:value-of select="$stringIn"/>
			</xsl:otherwise>

		</xsl:choose>
	</xsl:template>


	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>


	<!-- When we match the top-level element, we iterate over all of the
			rules, sorting by the specificity attribute found on each
			'selector' element found under each rule. -->
	<xsl:template match="css:stylesheet">

		<!-- We've got to supply a top-level 'result' element, since we may
				be returning both a style and a script node -->
		<result>

			<!-- Generate the CSS text -->
			<html:style type="text/css">

				<!-- We build up the style output into a variable and output
						it all at once to avoid lots of CDATAs - one for
						each little chunk of text. -->
				<xsl:variable name="styleOutput">
				
					<xsl:for-each select="css:rule">
						<xsl:sort select="css:selector/@specificity" data-type="number"/>
						<xsl:apply-templates select="."/>
					</xsl:for-each>

				</xsl:variable>
				
				<xsl:value-of select="$styleOutput"/>

			</html:style>

			<xsl:if test="$browser = 'ie' and $revMajor = 6 and count(//css:target[@environment = 'ie6']) > 0">
				<html:script type="text/javascript">

					<!-- We build up the script output into a variable and
							output it all at once to avoid lots of CDATAs -
							one for each little chunk of text. -->
					<xsl:variable name="scriptOutput">
					
						<!-- We generate a JavaScript literal Object that we
								will use as a 'selector map' and add its
								entries to the window's selectorMap. We then
								iterate over all of the selectors and
								generate a JavaScript 'key/value' pair entry
								for each one. -->
						<xsl:text>&#10;addToSelectorMap({&#10;</xsl:text>

						<!-- Note here how we only generate map entries for
								those selectors that have a 'css:target'
								child that has an environment variable of
								'ie6'. Note also that there may be multiple
								'css:stylesheet' children under the 'head'
								element, which is why we use the double slash
								syntax. -->
						<xsl:for-each select="//css:stylesheet/css:rule/css:selector[css:target[@environment = 'ie6']]">

							<!-- Call the selector map generator template -->
							<xsl:call-template name="selectorMapGen"/>

							<!-- If this isn't the last one of this filtered
									set, then put a comma here to separate
									the key/value entries in the map. -->
							<xsl:if test="position() != last()">
								<xsl:text>,&#10;</xsl:text>
							</xsl:if>

						</xsl:for-each>

						<xsl:text>&#10;});&#10;</xsl:text>

					</xsl:variable>

					<!-- Go ahead and output the value of the scriptOutput
							variable. -->
					<xsl:value-of select="$scriptOutput"/>

				</html:script>

			</xsl:if>
		
		</result>

	</xsl:template>


	<!-- For now, we don't process comments...	
	<xsl:template match="css:comment">
		<xsl:text>&#10;</xsl:text>
		<xsl:value-of select="."/>
		<xsl:text>&#10;</xsl:text>
	</xsl:template>
	-->


	<!-- When we match a 'css rule', we process its child 'selector' and
			'declarations' elements. -->
	<xsl:template match="css:rule">
		<xsl:apply-templates select="css:selector"/>
		<xsl:text>&#10;{&#10;</xsl:text>
		<xsl:apply-templates select="css:declaration"/>
		<xsl:text>&#10;}&#10;</xsl:text>
	</xsl:template>


	<!-- When we match a 'css selector', we process the selector a bit
			differently based on the browser that we're currently in.
			Current targets are either IE6 or CSS2 compliant browsers. -->
	<xsl:template match="css:selector">
		<xsl:choose>

			<!-- If there was a 'target', that means that we have target
					specific selectors -->
			<xsl:when test="css:target">
				<xsl:choose>

					<!-- When the browser is IE6, we'll always use the IE6
							version of the selector. -->
					<xsl:when test="$browser = 'ie' and $revMajor = 6">

						<!-- Note here how we change '\:' entries to use '_'
								due to the way we compute ie6 class names.
								We use our 'replaceCharsInString' template
								to replace whole sequences, not just
								individual characters. -->
						<xsl:variable name="ie6TargetSelector">
							<xsl:call-template name="replaceCharsInString">
								<xsl:with-param name="stringIn" select="string(css:target[@environment = 'ie6'])"/>
								<xsl:with-param name="charsIn" select="'\:'"/>
								<xsl:with-param name="charsOut" select="'_'"/>
							</xsl:call-template>
						</xsl:variable>
  
						<xsl:value-of select="string($ie6TargetSelector)"/>

					</xsl:when>

					<!-- Otherwise, we'll see if there was a 'CSS2' version
							of the selector. If there was, that means that
							a 'TIBET-related substitution' was done (i.e.
							a pseudoclass related to TIBET was present, etc.)
							If not, we just use the 'source' selector that
							the developer originally supplied. -->
					<xsl:otherwise>
						<xsl:choose>
							<xsl:when test="css:target[@environment = 'css2']">
								<xsl:value-of
									select="css:target[@environment = 'css2']"/>
							</xsl:when>
							<xsl:otherwise>
								<xsl:value-of select="css:source"/>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:otherwise>

				</xsl:choose>
			</xsl:when>

			<!-- Otherwise, there were no target specific selectors, so we
					just use the 'source' selector that the developer
					originally supplied. -->
			<xsl:otherwise>
				<xsl:value-of select="css:source"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>


	<!-- When we match a 'css declaration', we process the declaration into
			a text representation matching the CSS specification. -->
	<xsl:template match="css:declaration">
		<xsl:text>&#9;</xsl:text>
		<xsl:value-of select="@name"/>
		<xsl:text>: </xsl:text>
		<xsl:value-of select="."/>
		<xsl:text>;&#10;</xsl:text>
	</xsl:template>

	
	<!-- JavaScript generation -->

	<!-- When we match each selector in 'JavaScript generation mode', we
			generate a 'key/value' map entry for each one. -->
	<xsl:template name="selectorMapGen">

			<xsl:text>"</xsl:text>

			<!-- Grab the original CSS2 selector, or the original source if
					a separate CSS2 selector wasn't defined. -->
			<xsl:variable name="css2Selector">
				<xsl:choose>
					<xsl:when test="css:target[@environment = 'css2']">
						<xsl:value-of select="css:target[@environment = 'css2']"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="css:source"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<!-- Note here how we change '\:' entries to use '|' due to the
					way we compute CSS2 class names. We use our
					'replaceCharsInString' template to replace whole
					sequences, not just individual characters. -->
			<xsl:variable name="css2TargetSelector">
				<xsl:call-template name="replaceCharsInString">
					<xsl:with-param name="stringIn" select="string($css2Selector)"/>
					<xsl:with-param name="charsIn" select="'\:'"/>
					<xsl:with-param name="charsOut" select="'|'"/>
				</xsl:call-template>
			</xsl:variable>

			<!-- Here we use 'replaceCharsInString' to escape double quotes
					so that JavaScript will be happy. -->
			<xsl:variable name="css2TargetSelectorEscapedQuotes">
				<xsl:call-template name="replaceCharsInString">
					<xsl:with-param name="stringIn" select="string($css2TargetSelector)"/>
					<xsl:with-param name="charsIn" select="'&quot;'"/>
					<xsl:with-param name="charsOut" select="'\&#34;'"/>
				</xsl:call-template>
			</xsl:variable>

			<xsl:value-of select="string($css2TargetSelectorEscapedQuotes)"/>

			<xsl:text>" : "</xsl:text>

			<!-- Grab the original IE6 selector, or the original source if
					a separate IE6 selector wasn't defined. -->
			<xsl:variable name="ie6Selector">
				<xsl:choose>
					<xsl:when test="css:target[@environment = 'ie6']">
						<xsl:value-of select="css:target[@environment = 'ie6']"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="css:source"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<!-- Note here how we change '\:' entries to use '_' due to the
					way we compute IE6 class names. We use our
					'replaceCharsInString' template to replace whole
					sequences, not just individual characters. -->
			<xsl:variable name="ie6TargetSelector">
				<xsl:call-template name="replaceCharsInString">
					<xsl:with-param name="stringIn" select="string($ie6Selector)"/>
					<xsl:with-param name="charsIn" select="'\:'"/>
					<xsl:with-param name="charsOut" select="'_'"/>
				</xsl:call-template>
			</xsl:variable>

			<!-- Here we use 'replaceCharsInString' to escape double quotes
					so that JavaScript will be happy. -->
			<xsl:variable name="ie6TargetSelectorEscapedQuotes">
				<xsl:call-template name="replaceCharsInString">
					<xsl:with-param name="stringIn" select="translate(string($ie6TargetSelector),'\','')"/>
					<xsl:with-param name="charsIn" select="'&quot;'"/>
					<xsl:with-param name="charsOut" select="'\&#34;'"/>
				</xsl:call-template>
			</xsl:variable>

			<xsl:value-of select="string($ie6TargetSelectorEscapedQuotes)"/>

			<xsl:text>"</xsl:text>

	</xsl:template>

</xsl:stylesheet>
