/*
 * Copyright © 2020 Lukas Rosenthaler, Rita Gautschy, Benjamin Geer, Ivan Subotic,
 * Tobias Schweizer, André Kilchenmann, and Sepideh Alassi.
 *
 * This file is part of JDNConvertibleCalendar.
 *
 * JDNConvertibleCalendar is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JDNConvertibleCalendar is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with JDNConvertibleCalendar.  If not, see <http://www.gnu.org/licenses/>.
 */

export module TypeDefinitionsModule {

    /**
     * Type alias for a Julian Day Number (JDN).
     *
     * A JDN is an integer representing a Julian Day (without fraction).
     */
    export type JDN = number;

    /**
     * Type alias for a Julian Day Count (JDC).
     *
     * A JDC is a number representing a Julian Day with daytime (including a fraction).
     *
     * Attention: A fraction of .5 represents midnight, .0 represents noon.
     *
     */
    export type JDC = number;

}
